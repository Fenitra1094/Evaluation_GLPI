/**
 * Stratégies pour l'import des images (depuis un ZIP)
 * Upload via fetch natif (plus fiable que axios pour multipart)
 */

import JSZip from 'jszip'
import { glpiApi } from '@/api/glpi/core'
import { ensureSession } from '@/api/glpi/session'
import { findItemByName } from './ticketStrategies'

/**
 * Lit un fichier ZIP
 */
export async function readZipFile(file) {
  const zip = await JSZip.loadAsync(file)
  const images = []

  for (const filename of Object.keys(zip.files)) {
    const entry = zip.files[filename]
    if (entry.dir) continue

    const ext = filename.split('.').pop().toLowerCase()
    if (!['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) continue

    const baseName = filename.split('/').pop().replace(/\.[^.]+$/, '')

    images.push({ filename, baseName, extension: ext, entry })
  }

  return images
}

function getMimeType(ext) {
  const types = {
    png : 'image/png',
    jpg : 'image/jpeg',
    jpeg: 'image/jpeg',
    gif : 'image/gif',
    webp: 'image/webp',
    bmp : 'image/bmp',
  }
  return types[ext.toLowerCase()] || 'application/octet-stream'
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
    logFn('warning', `   ⚠️ Asset "${baseName}" introuvable`)
    return null
  }

  // 2. Préparer le fichier
  const blob      = await entry.async('blob')
  const mimeType  = getMimeType(extension)
  const cleanName = `${baseName}.${extension}`

  // ✅ Créer un vrai File avec le bon MIME
  const file = new File([blob], cleanName, { type: mimeType })

  logFn('info', `   📤 Upload "${cleanName}" (${mimeType}, ${(file.size / 1024).toFixed(1)} KB)`)

  // 3. S'assurer qu'on a une session
  await ensureSession()

  // 4. Récupérer les tokens
  const sessionToken = sessionStorage.getItem('glpi_session_token')
  const appToken     = import.meta.env.VITE_GLPI_APP_TOKEN
  const baseUrl      = import.meta.env.VITE_GLPI_BASE_URL

  // 5. Préparer FormData
  const formData = new FormData()
  formData.append(
    'uploadManifest',
    JSON.stringify({
      input: {
        name      : baseName,
        _filename : [cleanName],
      }
    })
  )
  formData.append('filename[0]', file, cleanName)

  // 6. ✅ UPLOAD AVEC FETCH (PAS AXIOS)
  try {
    const uploadResponse = await fetch(`${baseUrl}/Document`, {
      method: 'POST',
      headers: {
        'Session-Token': sessionToken,
        'App-Token'    : appToken,
        // ⚠️ PAS de Content-Type ! fetch le mettra avec boundary
      },
      body: formData,
    })

    // Récupérer la réponse
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
    logFn('error', `   ❌ Erreur upload "${cleanName}" : ${err.message}`)
    throw new Error(`Upload "${cleanName}" : ${err.message}`)
  }
}