/**
 * Stratégies pour l'import des coûts de tickets
 *
 * Format CSV :
 * Num_Ticket,Duration_second,Time_Cost,Fixed_Cost
 * 1,0,0,109
 * 1,600,"8,7",50
 *
 * Création :
 *   - 1 TicketCost dans GLPI
 *   - 1 ou plusieurs lignes dans SQLite (cout) avec type=GLPI
 *     répartis entre les items du ticket
 */

import GlpiClient from '@/api/glpiClient'
import LocalApi   from '@/api/localClient'

// =========================================================
// HELPERS
// =========================================================

/**
 * Parse un nombre avec virgule française (8,7 → 8.7)
 */
function parseFloatFr(value) {
  if (!value) return 0
  return parseFloat(String(value).replace(',', '.')) || 0
}

/**
 * Calcule le coût total d'une ligne CSV
 *   total = (secondes / 3600) × cost_time + cost_fixed + cost_material
 */
function calculateTotal({ duration, timeCost, fixedCost, material = 0 }) {
  const timePart = (duration / 3600) * timeCost
  return timePart + fixedCost + material
}

// =========================================================
// FONCTION PRINCIPALE
// =========================================================

/**
 * Crée un TicketCost GLPI + le coût SQLite réparti entre items
 *
 * @param {Object}   row        - ligne CSV { Num_Ticket, Duration_second, Time_Cost, Fixed_Cost }
 * @param {Map}      ticketsMap - Map Ref_Ticket → ticketId GLPI
 * @param {Map}      itemsMap   - Map ticketId → liste items [{itemtype, items_id}]
 * @param {Function} log        - fonction de log
 */
export async function createTicketCost(row, ticketsMap, itemsMap, log) {
  const logFn = log || (() => {})

  // ─── 1. Récupérer le ticket GLPI ────────────────────────
  const refTicket = String(row.Num_Ticket)
  const ticketId  = ticketsMap.get(refTicket)

  if (!ticketId) {
    throw new Error(
      `Ticket Ref=${refTicket} introuvable (les tickets doivent être importés avant les coûts)`
    )
  }

  // ─── 2. Calculer les valeurs ────────────────────────────
  const duration  = parseInt(row.Duration_second) || 0
  const timeCost  = parseFloatFr(row.Time_Cost)
  const fixedCost = parseFloatFr(row.Fixed_Cost)
  const material  = 0

  const total = calculateTotal({ duration, timeCost, fixedCost, material })

  logFn('info', `💰 Coût ticket Ref=${refTicket} (GLPI id=${ticketId})`)
  logFn('info', `   ↳ Durée: ${duration}s | Horaire: ${timeCost}€ | Fixe: ${fixedCost}€`)
  logFn('info', `   ↳ TOTAL calculé : ${total.toFixed(2)}€`)

  // ─── 3. Créer le TicketCost GLPI ─────────────────────────
  const costData = {
    tickets_id    : ticketId,
    name          : `Coût ticket #${refTicket}`,
    actiontime    : duration,
    cost_time     : timeCost,
    cost_fixed    : fixedCost,
    cost_material : material,
    begin_date    : new Date().toISOString().split('T')[0],
    end_date      : new Date().toISOString().split('T')[0],
  }

  const costId = await GlpiClient.createItem('TicketCost', costData)
  logFn('success', `   ✅ TicketCost GLPI créé (id=${costId})`)

  // ─── 4. Créer le coût SQLite réparti entre les items ────
  let sqliteIds = []
  try {
    const items = itemsMap.get(ticketId) || []

    if (items.length === 0) {
      logFn('warning', `   ⚠️ Aucun item lié au ticket, coût SQLite non créé`)
    } else if (total <= 0) {
      logFn('warning', `   ⚠️ Total = 0, coût SQLite non créé`)
    } else {
      sqliteIds = await LocalApi.createTicketSolution(
        ticketId,
        total,
        items,
        'GLPI'   // ⭐ type spécial pour identifier l'origine
      )
      logFn('success', `   ✅ Coût SQLite réparti entre ${items.length} item(s)`)
    }
  } catch (err) {
    logFn('warning', `   ⚠️ Erreur création coût SQLite : ${err.message}`)
    // On ne fait pas échouer l'import pour autant
  }

  return { costId, ticketId, refTicket, total, sqliteIds }
}