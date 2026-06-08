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

/**
 * Récupère TOUS les items de TOUS les types
 * Avec progression
 */
export async function getAllItems(onProgress = null) {
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
export async function getItemById(itemtype, id) {
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