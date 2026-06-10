/**
 * API pour gérer les éléments (assets) GLPI
 */

import { glpiApi } from '../core'
import { ensureSession } from '../session'

// =========================================================
// LISTE DES TYPES SUPPORTÉS
// =========================================================
export const ITEM_TYPES = [
  { key: 'Computer',         label: 'Ordinateurs',     icon: '💻', color: 'purple' },
  { key: 'Monitor',          label: 'Écrans',          icon: '🖥️', color: 'blue'   },
  { key: 'Printer',          label: 'Imprimantes',     icon: '🖨️', color: 'orange' },
  { key: 'Phone',            label: 'Téléphones',      icon: '📞', color: 'green'  },
  { key: 'NetworkEquipment', label: 'Réseau',          icon: '🌐', color: 'cyan'   },
  { key: 'Peripheral',       label: 'Périphériques',   icon: '⌨️', color: 'pink'   },
  { key: 'Rack',             label: 'Baies',           icon: '🗄️', color: 'gray'   },
  { key: 'PDU',              label: 'PDU',             icon: '🔌', color: 'yellow' },
  { key: 'Enclosure',        label: 'Châssis',         icon: '📦', color: 'indigo' },
  { key: 'Software',         label: 'Logiciels',       icon: '💿', color: 'red'    },
  { key: 'Cartridge',        label: 'Cartouches',      icon: '🖌️', color: 'lime'   },
  { key: 'Consumable',       label: 'Consommables',    icon: '📋', color: 'teal'   },
  { key: 'Cable',            label: 'Câbles',          icon: '🔗', color: 'rose'   },
]

// =========================================================
// FONCTIONS API
// =========================================================

/**
 * Récupère TOUS les items d'un type donné avec dropdowns développés
 */
export async function getItemsByType(itemtype, { start = 0, limit = 1000 } = {}) {
  await ensureSession()

  const range = `${start}-${start + limit - 1}`

  try {
    const response = await glpiApi.get(`/${itemtype}`, {
      params: {
        expand_dropdowns: true,
        range,
        sort : 'id',
        order: 'ASC',
      },
    })
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    return []
  }
}


export async function getItemDocuments(itemtype, itemId) {
  await ensureSession()


  try {
    const url = `/${itemtype}/${itemId}/Document_Item`
    const linksResponse = await glpiApi.get(url)

    const links = Array.isArray(linksResponse.data) ? linksResponse.data : []

    if (links.length === 0) return []

    const documents = []
    for (const link of links) {
      try {
        const docId = typeof link.documents_id === 'object'
          ? link.documents_id.id
          : link.documents_id

        // Métadonnées du document
        const docResponse = await glpiApi.get(`/Document/${docId}`)
        const doc = docResponse.data

        // ✅ NOUVELLE LOGIQUE : on filtre par MIME ou extension
        const isImageByMime = doc.mime && doc.mime.startsWith('image/')
        const displayName = doc.filename || doc.name || `document-${docId}`
        const isImageByExt = /\.(png|jpe?g|gif|webp|bmp)$/i.test(displayName)

        if (!isImageByMime && !isImageByExt) {
          continue
        }

        // Télécharger le binaire
        const blobUrl = await fetchDocumentBlob(docId)

        documents.push({
          id:       doc.id,
          name:     displayName,
          filename: doc.filename,
          mime:     doc.mime,
          url:      blobUrl,
        })
      } catch (e) {
        console.error(`❌ Erreur traitement document`, e)
      }
    }

    
    return documents
  } catch (error) {
    console.error('❌ Erreur getItemDocuments', error)
    return []
  }
}


async function fetchDocumentBlob(docId) {
  const baseUrl      = import.meta.env.VITE_GLPI_BASE_URL
  const sessionToken = sessionStorage.getItem('glpi_session_token')
  const appToken     = import.meta.env.VITE_GLPI_APP_TOKEN

  try {
    // ✅ AJOUTER ?alt=media pour forcer le téléchargement du fichier
    const response = await fetch(`${baseUrl}/Document/${docId}?alt=media`, {
      headers: {
        'App-Token':     appToken,
        'Session-Token': sessionToken,
        'Accept':        'application/octet-stream',
      },
    })

    if (!response.ok) {
      console.error(`Erreur téléchargement document ${docId}: HTTP ${response.status}`)
      return null
    }

    const blob = await response.blob()

    if (blob.size === 0) {
      console.warn(`Document ${docId} : blob vide`)
      return null
    }


    return URL.createObjectURL(blob)
  } catch (error) {
    console.error(`Erreur fetchDocumentBlob(${docId})`, error)
    return null
  }
} 

/**
 * Récupère TOUS les items de TOUS les types
 * Avec progression
 */
export async function fetchAllTypesItems(onProgress = null) {
  const allItems = []

  for (let i = 0; i < ITEM_TYPES.length; i++) {
    const type = ITEM_TYPES[i]

    if (onProgress) {
      onProgress({
        current: i + 1,
        total  : ITEM_TYPES.length,
        label  : type.label,
      })
    }

    const items = await getItemsByType(type.key)

    items.forEach(item => {
      allItems.push({
        ...item,
        _itemtype: type.key,
        _typeLabel: type.label,
        _typeIcon : type.icon,
        _typeColor: type.color,
      })
    })
  }

  return allItems
}

/**
 * Récupère un item spécifique par type et ID
 */
export async function fetchItemById(itemtype, id) {
  await ensureSession()

  try {
    const response = await glpiApi.get(`/${itemtype}/${id}`, {
      params: { expand_dropdowns: true },
    })
    return response.data
  } catch (error) {
    return null
  }
}