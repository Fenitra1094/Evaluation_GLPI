/**
 * Stratégies pour l'import des images (depuis un ZIP)
 * Upload via fetch natif (plus fiable que axios pour multipart)
 */
import JSZip from 'jszip'
import { glpiApi } from '@/api/glpi/core'
import { ensureSession } from '@/api/glpi/session'
import { findItemByName } from './ticketStrategies'

    /**
     * Détecte le VRAI type MIME via les magic bytes
     * (les premiers octets du fichier)
     *
     * Pourquoi ? Un fichier peut s'appeler .png mais être un JPEG.
     * GLPI refuse alors le fichier ou enregistre name=null.
     */
    function detectMime(data) {
      // data peut être un ArrayBuffer ou Uint8Array
      const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)

      // JPEG  : FF D8 FF
      if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF)
        return { mime: 'image/jpeg', ext: 'jpeg' }

      // PNG   : 89 50 4E 47
      if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47)
        return { mime: 'image/png', ext: 'png' }

      // GIF   : 47 49 46
      if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46)
        return { mime: 'image/gif', ext: 'gif' }

      // WEBP  : 52 49 46 46 ?? ?? ?? ?? 57 45 42 50
      if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
          && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50)
        return { mime: 'image/webp', ext: 'webp' }

      // BMP   : 42 4D
      if (bytes[0] === 0x42 && bytes[1] === 0x4D)
        return { mime: 'image/bmp', ext: 'bmp' }

      return null
    }

/**
 * Lit un fichier ZIP (ignore les fichiers MacOS cachés)
 */
export async function readZipFile(file) {
  const zip = await JSZip.loadAsync(file)
  const images = []
  
  for (const filename of Object.keys(zip.files)) {
    const entry = zip.files[filename]
    
    // Ignore les dossiers ET les fichiers cachés MacOS
    if (entry.dir || filename.includes('__MACOSX') || filename.split('/').pop().startsWith('._')) {
      continue
    }

    const ext = filename.split('.').pop().toLowerCase()
    if (!['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) continue

    const baseName = filename.split('/').pop().replace(/\.[^.]+$/, '')
    images.push({ filename, baseName, extension: ext, entry })
  }

  return images
}


/**
 * Upload une image via FETCH (pas axios)
 */
export async function uploadImageForAsset(imageInfo, log) {
  const logFn = log || (() => {})
  const { baseName, filename, extension, entry } = imageInfo
  
  // 1. Trouver l'asset
  logFn('info', `🖼️ Recherche asset "${baseName}"`)
  const found = await findItemByName(baseName)

  if (!found) {
    logFn('warning', `⚠️ Asset "${baseName}" introuvable`)
    return null
  }

  // 2. Préparer le fichier de manière SÉCURISÉE
    const arrayBuffer = await entry.async('arraybuffer')

    // 🆕 DÉTECTION DU VRAI MIME via magic bytes
    const detected = detectMime(arrayBuffer)
    const mimeType = detected?.mime || getMimeType(extension)
    const realExt  = detected?.ext  || extension

    // Renommer le fichier avec la VRAIE extension
    // Ex: PC-ADM-001.png → PC-ADM-001.jpeg si c'est en réalité du JPEG
    const cleanName = `${baseName}.${realExt}`

    // Si l'extension a été corrigée, on prévient dans les logs
    if (detected && detected.ext !== extension.toLowerCase()) {
      logFn('warning',
        `⚠️ Fichier "${filename}" déclaré ".${extension}" est en réalité du ${detected.mime}. Renommé en "${cleanName}"`
      )
    }

    // ✅ Créer un Blob avec le BON MIME détecté
    const blob = new Blob([arrayBuffer], { type: mimeType })

    logFn('info', `📤 Upload "${cleanName}" (${mimeType}, ${(blob.size / 1024).toFixed(1)} KB)`)

  // 3. S'assurer qu'on a une session
  await ensureSession()

  // 4. Récupérer les tokens
  const sessionToken = sessionStorage.getItem('glpi_session_token')
  const appToken = import.meta.env.VITE_GLPI_APP_TOKEN
  const baseUrl = import.meta.env.VITE_GLPI_BASE_URL

  // 5. Préparer FormData
  const formData = new FormData()
  formData.append(
    'uploadManifest',
    JSON.stringify({
      input: {
        name : baseName,
        _filename : [cleanName],
      }
    })
  )
  
  // ✅ On passe directement le Blob au FormData
  formData.append('filename[0]', blob, cleanName)

  // 6. ✅ UPLOAD AVEC FETCH
  try {
    const uploadResponse = await fetch(`${baseUrl}/Document`, {
      method: 'POST',
      headers: {
        'Session-Token': sessionToken,
        'App-Token' : appToken,
        // ⚠️ PAS de Content-Type ! fetch le mettra avec boundary
      },
      body: formData,
    })

    const responseText = await uploadResponse.text()
    let responseData

    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`Réponse invalide : ${responseText.substring(0, 100)}`)
    }

    if (!uploadResponse.ok) {
      const errMsg = Array.isArray(responseData)
        ? `${responseData[0]} - ${responseData[1]}`
        : `HTTP ${uploadResponse.status}`
      throw new Error(errMsg)
    }

    const created = Array.isArray(responseData) ? responseData[0] : responseData
    const documentId = created.id

    if (!documentId) {
      throw new Error(`Pas d'ID retourné. Réponse : ${responseText}`)
    }

    logFn('success', `   ✅ Document créé (id=${documentId})`)

    // 7. Lier le Document à l'asset
    let linkId = null
    try {
      const linkResponse = await glpiApi.post('/Document_Item', {
        input: {
          documents_id: documentId,
          itemtype    : found.itemtype,
          items_id    : found.id,
        }
      })

      const link = Array.isArray(linkResponse.data) ? linkResponse.data[0] : linkResponse.data
      linkId = link.id
      logFn('success', `   ✅ Lié à ${found.itemtype}#${found.id}`)
    } catch (linkErr) {
      logFn('warning', `   ⚠️ Liaison déjà existante`)
    }

    return {
      documentId,
      linkId,
      itemtype : found.itemtype,
      items_id : found.id,
      assetName: baseName,
      filename : cleanName,
    }
  } catch (err) {
    logFn('error', `❌ Erreur upload "${cleanName}" : ${err.message}`)
    throw new Error(`Upload "${cleanName}" : ${err.message}`)
  }
}