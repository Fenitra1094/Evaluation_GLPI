import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'

// =========================================================
// COLONNES DU KANBAN
// =========================================================
export const KANBAN_COLUMNS = [
  { id: 'new',      label: 'Nouveau',     icon: '🔵', color: 'blue',   status: 1 },
  { id: 'progress', label: 'In progress', icon: '🟠', color: 'orange', status: 2 },
  { id: 'done',     label: 'Terminé',     icon: '🟢', color: 'green',  status: 6 },
]

const KANBAN_STATUSES = KANBAN_COLUMNS.map(c => c.status)

export const useKanbanStore = defineStore('kanban', () => {

  // ============ STATE ============
  const allTickets     = ref([])
  const loading        = ref(false)
  const error          = ref(null)
  const selectedTicket = ref(null)
  const availableUsers = ref([])

  // ============ GETTERS ============
  const ticketsByColumn = computed(() => {
    const result = {}
    KANBAN_COLUMNS.forEach(col => {
      result[col.id] = allTickets.value.filter(t => t.status === col.status)
    })
    return result
  })

  const totalByColumn = computed(() => {
    const result = {}
    KANBAN_COLUMNS.forEach(col => {
      result[col.id] = ticketsByColumn.value[col.id].length
    })
    return result
  })

  // ============ ACTIONS ============

  async function loadTickets() {
    loading.value = true
    error.value   = null

    try {
      const tickets = await GlpiClient.getTickets({
        start: 0, limit: 500,
        sort: 'date_creation', order: 'DESC',
      })

      // Garder seulement les statuts Kanban (1, 2, 6)
      allTickets.value = tickets.filter(t => KANBAN_STATUSES.includes(t.status))
      console.log(`✅ Kanban : ${allTickets.value.length} tickets`)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function loadUsers() {
    try {
      availableUsers.value = await GlpiClient.getAllItemsWithDetails('User')
    } catch (e) {
      availableUsers.value = []
    }
  }

  /**
   * Change le statut + actions selon extras
   */
  async function changeStatus(ticketId, newStatus, extra = {}) {
    try {
      // 1. Mettre à jour le statut
      await GlpiClient.updateTicketStatus(ticketId, newStatus)

      // 2. Assigner un acteur (Nouveau → Attribué)
      if (extra.userId) {
        try {
          await GlpiClient.addTicketActor(ticketId, extra.userId, 2)
        } catch (e) {
          console.warn('⚠️ Erreur acteur', e.message)
        }
      }

      // 3. Ajouter une solution (Attribué → Clos)
      if (extra.solution) {
        try {
          await GlpiClient.createTicketSolution(ticketId, extra.solution)
        } catch (e) {
          console.warn('⚠️ Erreur solution', e.message)
        }
      }

      // 4. Ajouter un commentaire (réouverture)
      if (extra.comment) {
        try {
          await GlpiClient.addTicketFollowup(ticketId, extra.comment)
        } catch (e) {
          console.warn('⚠️ Erreur commentaire', e.message)
        }
      }

      // 5. Mise à jour locale
      const ticket = allTickets.value.find(t => t.id === ticketId)
      if (ticket) ticket.status = newStatus

      console.log(`✅ Ticket #${ticketId} → status ${newStatus}`)
      return true
    } catch (err) {
      error.value = err.message
      return false
    }
  }

  async function createSimpleTicket({ name, content, status = 1 }) {
    try {
      const ticketId = await GlpiClient.createTicket({ name, content, status })
      await loadTickets()
      return ticketId
    } catch (err) {
      error.value = err.message
      return null
    }
  }

  function selectTicket(ticket) {
    selectedTicket.value = ticket
  }

  function closeDetail() {
    selectedTicket.value = null
  }

  return {
    allTickets, loading, error, selectedTicket, availableUsers,
    ticketsByColumn, totalByColumn,
    loadTickets, loadUsers,
    changeStatus, createSimpleTicket,
    selectTicket, closeDetail,
  }
})