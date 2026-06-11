/**
 * Stratégies pour l'import de tickets
 */

import GlpiClient from '@/api/glpiClient'

// =========================================================
// MAPPINGS GLPI
// =========================================================

export const TICKET_TYPE_MAPPING = {
  'Incident' : 1,
  'Request'  : 2,
  'Demande'  : 2,
}

export const TICKET_STATUS_MAPPING = {
  'New'        : 1,
  'Nouveau'    : 1,
  'In progress' : 2,
  'In progress (assigned)' : 2,
  'En cours'   : 2,
  'Planned'    : 3,
  'Planifié'   : 3,
  'Pending'    : 4,
  'En attente' : 4,
  'Solved'     : 5,
  'Résolu'     : 5,
  'Closed'     : 6,
  'Clos'       : 6,
}

export const TICKET_PRIORITY_MAPPING = {
  'Very Low'   : 1,
  'Très basse' : 1,
  'Low'        : 2,
  'Basse'      : 2,
  'Medium'     : 3,
  'Moyenne'    : 3,
  'High'       : 4,
  'Haute'      : 4,
  'Very High'  : 5,
  'Très haute' : 5,
  'Major'      : 6,
  'Majeure'    : 6,
}

// =========================================================
// HELPERS
// =========================================================

/**
 * Convertit "03/06/2026" + "13:45" → "2026-06-03 13:45:00"
 */
export function parseDateTime(dateStr, heureStr) {
  if (!dateStr) return null
  const [day, month, year] = dateStr.split('/')

  let time = heureStr || '00:00'
  if (!time.includes(':')) time = '00:00'
  if (time.split(':').length === 2) time += ':00'

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${time}`
}

/**
 * Parse la colonne Items : ["PC-ADM-001","MN-FORM-002"]
 */
export function parseItemsArray(itemsStr) {
  if (!itemsStr) return []

  try {
    const cleaned = itemsStr.trim()
    if (cleaned.startsWith('[')) {
      return JSON.parse(cleaned)
    }
    return cleaned.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''))
  } catch (err) {
    console.warn('Erreur parsing Items :', itemsStr)
    return []
  }
}

/**
 * Recherche un item par son nom dans tous les types possibles
 */
const ITEM_TYPES_TO_SEARCH = [
  'Computer', 'Monitor', 'Printer', 'Phone',
  'NetworkEquipment', 'Peripheral', 'Rack', 'PDU',
  'Enclosure', 'Cable',
]

export async function findItemByName(name) {
  for (const itemtype of ITEM_TYPES_TO_SEARCH) {
    try {
      const id = await GlpiClient.findDropdownByName(itemtype, name)
      if (id) {
        return { id, itemtype }
      }
    } catch (err) {
      // continue
    }
  }
  return null
}

// =========================================================
// STRATÉGIE PRINCIPALE
// =========================================================

export async function createTicket(row, log) {
  const logFn = log || (() => {})

  const typeId     = TICKET_TYPE_MAPPING[row.Type]         || 1
  const statusId   = TICKET_STATUS_MAPPING[row.Status]     || 1
  const priorityId = TICKET_PRIORITY_MAPPING[row.Priority] || 3
  const dateTime   = parseDateTime(row.Date, row.Heure)

  const ticketData = {
    name     : row.Titre,
    content  : row.Description || row.Titre,
    type     : typeId,
    status   : statusId,
    priority : priorityId,
    urgency  : priorityId,
    impact   : priorityId,
  }

  if (dateTime) {
    ticketData.date = dateTime
  }

  logFn('info', `🎫 Création du ticket "${row.Titre}"`)
  const ticketId = await GlpiClient.createItem('Ticket', ticketData)
  logFn('success', `✅ Ticket créé (id=${ticketId})`)

  // Associer les items
  const itemNames = parseItemsArray(row.Items)
  const linkedItems = []

  for (const itemName of itemNames) {
    logFn('info', `   ↳ Recherche de l'item "${itemName}"`)
    const found = await findItemByName(itemName)

    if (!found) {
      logFn('warning', `   ⚠️ Item "${itemName}" introuvable, ignoré`)
      continue
    }

    try {
      const linkId = await GlpiClient.createItem('Item_Ticket', {
        tickets_id : ticketId,
        items_id   : found.id,
        itemtype   : found.itemtype,
      })
      linkedItems.push({ ...found, linkId, name: itemName })
      logFn('success', `   ✅ Lié : ${found.itemtype}#${found.id}`)
    } catch (err) {
      logFn('error', `   ❌ Erreur liaison ${itemName} : ${err.message}`)
    }
  }

  return {
    ticketId,
    refTicket: row.Ref_Ticket,
    linkedItems,
  }
}