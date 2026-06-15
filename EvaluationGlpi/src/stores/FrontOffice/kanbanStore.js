import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'
import LocalApi from '@/api/localClient'

export const KANBAN_COLUMNS = [
  { id: 'new',      label: 'Nouveau',     icon: '🔵', color: 'blue',   status: 1 },
  { id: 'progress', label: 'In progress', icon: '🟠', color: 'orange', status: 2 },
  { id: 'done',     label: 'Closed',     icon: '🟢', color: 'green',  status: 6 },
]

const KANBAN_STATUSES = KANBAN_COLUMNS.map(c => c.status)

export const useKanbanStore = defineStore('kanban', () => {
  // ============ STATE ============
  const allTickets     = ref([])
  const loading        = ref(false)
  const error          = ref(null)
  const availableUsers = ref([])

  // ============ GETTERS ============
  const ticketsByColumn = computed(() => {
  const result = {}
  // Note : on doit attendre les settings, donc fallback sur les statuts hardcodés
  const cols = [
    { columnKey: 'new', status: 1 },
    { columnKey: 'progress', status: 2 },
    { columnKey: 'done', status: 6 },
  ]
  cols.forEach(col => {
    result[col.columnKey] = allTickets.value.filter(t => t.status === col.status)
  })
  return result
})

 const totalByColumn = computed(() => {
  const result = {}
  Object.keys(ticketsByColumn.value).forEach(key => {
    result[key] = ticketsByColumn.value[key].length
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
  
  async function annulation(ticketId){
    try{
        await LocalApi.deleteCout(ticketId) 
    }
     catch (e) { console.warn('⚠️ Erreur acteur', e.message) }
  }

  async function changeStatus(ticketId, newStatus, extra = {}) {
  try {
    await GlpiClient.updateTicketStatus(ticketId, newStatus)

    if (extra.userId) {
      try { await GlpiClient.addTicketActor(ticketId, extra.userId, 2) }
      catch (e) { console.warn('⚠️ Erreur acteur', e.message) }
    }

    // ⭐ Vérifier explicitement avec > 0
    if (extra.cout && extra.cout > 0) {
      try { 
        console.log(`💰 Création SAISI : ${extra.cout}€ pour ticket #${ticketId}`)
        await LocalApi.createTicketSolution(ticketId, extra.cout) 
      }
      catch (e) { console.warn('⚠️ Erreur solution', e.message) }
    }

    // ⭐ Vérifier explicitement avec > 0
    if (extra.pourcentage && extra.pourcentage > 0) {
      try { 
        console.log(`🔄 Réouverture : ${extra.pourcentage}% pour ticket #${ticketId}`)
        await LocalApi.addPourcentage(ticketId, extra.pourcentage) 
      }
      catch (e) { console.warn('⚠️ Erreur pourcentage', e.message) }
    }

    if (extra.comment) {
      try { await GlpiClient.addTicketFollowup(ticketId, extra.comment) }
      catch (e) { console.warn('⚠️ Erreur commentaire', e.message) }
    }

    const ticket = allTickets.value.find(t => t.id === ticketId)
    if (ticket) ticket.status = newStatus

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

  return {
    allTickets, loading, error, availableUsers,
    ticketsByColumn, totalByColumn,
    loadTickets, loadUsers,
    changeStatus, createSimpleTicket,annulation,
  }
})