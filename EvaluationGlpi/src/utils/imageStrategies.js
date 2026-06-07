/**
 * Stratégies pour l'import des images (depuis un ZIP)
 */

import JSZip from 'jszip'
import { glpiApi } from '@/api/glpi/core'
import { ensureSession } from '@/api/glpi/session'
import { findItemByName } from './ticketStrategies'

/**
 * Lit un fichier ZIP et retourne ses entrées
 */
export async function readZipFile(file) {
  const zip = await JSZip.loadAsync(file)
  const images = []

  for (const filename of Object.keys(zip.files)) {
    const entry = zip.files[filename]

    if (entry.dir) continue

    const ext = filename.split('.').pop().toLowerCase()
    if (!['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) continue

    // Nettoyer le nom : enlever le chemin et l'extension
    const baseName = filename.split('/').pop().replace(/\.[^.]+$/, '')

    images.push({
      filename,
      baseName,
      extension: ext,
      entry,
    })
  }

  return images
}

/**
 * Convertit un Blob en File avec un nom
 */
function blobToFile(blob, filename) {
  return new File([blob], filename, { type: blob.type })
}

/**
 * Upload une image en tant que Document dans GLPI
 * Format attendu par GLPI :
 *
 * POST /Document
 * Content-Type: multipart/form-data
 *
 * Champ "uploadManifest" : { "input": { "name": "...", "_filename": ["fichier.png"] } }
 * Champ "filename[0]"    : <file>
 */
export async function uploadImageForAsset(imageInfo, log) {
  const logFn = log || (() => {})
  const { baseName, filename, extension, entry } = imageInfo

  // 1. Trouver l'asset par son nom
  logFn('info', `🖼️ Recherche asset "${baseName}"`)
  const found = await findItemByName(baseName)

  if (!found) {
    logFn('warning', `   ⚠️ Asset "${baseName}" introuvable, image ignorée`)
    return null
  }

  // 2. Récupérer le contenu en Blob
  const blob     = await entry.async('blob')
  const cleanName = `${baseName}.${extension}`
  const file     = blobToFile(blob, cleanName)

  await ensureSession()

  // 3. Préparer le FormData avec le format GLPI
  const formData = new FormData()

  // ⚠️ Format GLPI strict : uploadManifest en JSON dans un champ
  const manifest = {
    input: {
      name      : baseName,
      _filename : [cleanName],
    }
  }

  formData.append('uploadManifest', JSON.stringify(manifest))
  formData.append('filename[0]', file, cleanName)

  // 4. Upload du Document
  try {
    logFn('info', `   📤 Upload de "${cleanName}"...`)

    const response = await glpiApi.post('/Document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const created = Array.isArray(response.data) ? response.data[0] : response.data
    const documentId = created.id

    if (!documentId) {
      throw new Error('Document créé mais pas d\'id retourné')
    }

    logFn('success', `   ✅ Image uploadée (Document id=${documentId})`)

    // 5. Lier le Document à l'asset
    try {
      const linkResponse = await glpiApi.post('/Document_Item', {
        input: {
          documents_id: documentId,
          itemtype    : found.itemtype,
          items_id    : found.id,
        }
      })

      const link = Array.isArray(linkResponse.data) ? linkResponse.data[0] : linkResponse.data
      logFn('success', `   ✅ Image liée à ${found.itemtype}#${found.id}`)

      return {
        documentId,
        linkId    : link.id,
        itemtype  : found.itemtype,
        items_id  : found.id,
        assetName : baseName,
      }

    } catch (linkErr) {
      logFn('warning', `   ⚠️ Document créé mais liaison échouée : ${linkErr.message}`)
      return { documentId, assetName: baseName, itemtype: found.itemtype, items_id: found.id }
    }

  } catch (err) {
    // Extraire le vrai message d'erreur GLPI
    const errData = err.response?.data
    let errMsg = err.message

    if (Array.isArray(errData) && errData.length >= 2) {
      errMsg = `${errData[0]} - ${errData[1]}`
    }

    logFn('error', `   ❌ Erreur upload "${cleanName}" : ${errMsg}`)
    throw new Error(`Upload image "${cleanName}" : ${errMsg}`)
  }
}