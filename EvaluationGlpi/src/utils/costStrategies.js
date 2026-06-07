/**
 * Stratégies pour l'import des coûts de tickets
 *
 * Format CSV :
 * Num_Ticket,Duration_second,Time_Cost,Fixed_Cost
 * 1,0,0,109
 * 1,600,"8,7",50
 */

import GlpiClient from '@/api/glpiClient'

/**
 * Parse un nombre avec virgule française (8,7 → 8.7)
 */
function parseFloatFr(value) {
  if (!value) return 0
  return parseFloat(String(value).replace(',', '.')) || 0
}

/**
 * Convertit des secondes en HH:MM:SS pour actiontime
 */
function secondsToTime(seconds) {
  const s = parseInt(seconds) || 0
  return s  // GLPI accepte directement le nombre de secondes
}

/**
 * Crée un TicketCost (coût lié à un ticket)
 *
 * @param {Object} row - ligne CSV { Num_Ticket, Duration_second, Time_Cost, Fixed_Cost }
 * @param {Map} ticketsMap - Map Ref_Ticket → ticketId GLPI
 */
export async function createTicketCost(row, ticketsMap, log) {
  const logFn = log || (() => {})

  // 1. Trouver le ticket GLPI correspondant
  const refTicket = String(row.Num_Ticket)
  const ticketId  = ticketsMap.get(refTicket)

  if (!ticketId) {
    throw new Error(
      `Ticket Ref=${refTicket} introuvable (les tickets doivent être importés avant les coûts)`
    )
  }

  // 2. Construire les données du coût
  const duration  = parseInt(row.Duration_second) || 0
  const timeCost  = parseFloatFr(row.Time_Cost)
  const fixedCost = parseFloatFr(row.Fixed_Cost)

  const costData = {
    tickets_id   : ticketId,
    name         : `Coût ticket #${refTicket}`,
    actiontime   : duration,        // durée en secondes
    cost_time    : timeCost,        // coût horaire
    cost_fixed   : fixedCost,       // coût fixe
    cost_material: 0,               // coût matériel
    begin_date   : new Date().toISOString().split('T')[0],  // aujourd'hui
    end_date     : new Date().toISOString().split('T')[0],
  }

  logFn('info', `💰 Création coût pour ticket Ref=${refTicket} (GLPI id=${ticketId})`)
  logFn('info', `   ↳ Durée: ${duration}s | Coût horaire: ${timeCost}€ | Coût fixe: ${fixedCost}€`)

  const costId = await GlpiClient.createItem('TicketCost', costData)
  logFn('success', `   ✅ Coût créé (id=${costId})`)

  return { costId, ticketId, refTicket }
}