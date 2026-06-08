import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'
import {
  STATUS_LABELS,
  TYPE_LABELS,
  PRIORITY_LABELS,
} from '@/api/glpi/tickets'

export const useTicketsStore = defineStore('tickets', () => {
     // ---- STATE ----
  const tickets         = ref([])
  const selectedTicket  = ref(null)
  const ticketItems     = ref([])
  const ticketCosts     = ref([])
  const loading         = ref(false)
  const loadingDetails  = ref(false)
  const error           = ref(null)
  const search          = ref('')
  const filterStatus    = ref('all')
  const filterType      = ref('all')

  //Getters //
  const filteredTickets = computed(() => {
    let list = tickets.value

    if(search.value){
        const s = search.value.toLowerCase()
        list = list.filter(t =>
            t.name?.toLowerCase().includes(s) ||
            t.content?.toLowerCase().includes(s) ||
            String(t.id).includes(s)
        )
    }

    // filtre par status
    if(filterStatus.value !== 'all'){
        list = list.filter(t => t.status === parseInt(filterStatus.value))
    }

    // filtre par type
    if(filterType.value !== 'all'){
        list = list.filter(t => t.type === parseInt(filterType.value))
    }
    return list 

  })
  
  const totalByStatus = computed(() => {
    const stats = {}
    for (const id in STATUS_LABELS) {
      stats[id] = tickets.value.filter(t => t.status === parseInt(id)).length
    }
    return stats
  })

  async function loadTickets() {
    loading.value = true
    error.value = null

    try {
      tickets.value = await GlpiClient.getTickets({
        start: 0,
        limit: 500,
        sort : 'date_creation',
        order: 'DESC',
      })
    } catch (err) {
      error.value = err.message || 'Erreur de chargement'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function selectTicket(ticket) {
    selectedTicket.value = ticket
    loadingDetails.value = true
    ticketItems.value = []
    ticketCosts.value = []

    try {
      // Charger items et coûts en parallèle
      const [items, costs] = await Promise.all([
        GlpiClient.getTicketItems(ticket.id),
        GlpiClient.getTicketCosts(ticket.id),
      ])

      // Enrichir les items avec leurs détails
      const enrichedItems = await Promise.all(
        items.map(async (it) => {
          const details = await GlpiClient.getItemDetails(it.itemtype, it.items_id)
          return {
            ...it,
            details,
          }
        })
      )

      ticketItems.value = enrichedItems
      ticketCosts.value = costs

    } catch (err) {
      console.error('Erreur chargement détails :', err)
    } finally {
      loadingDetails.value = false
    }
  }

  function closeTicket() {
    selectedTicket.value = null
    ticketItems.value = []
    ticketCosts.value = []
  }

  function getStatusInfo(statusId) {
    return STATUS_LABELS[statusId] || { label: 'Inconnu', color: 'gray', icon: '❓' }
  }

  function getTypeInfo(typeId) {
    return TYPE_LABELS[typeId] || { label: 'Inconnu', color: 'gray', icon: '❓' }
  }

  function getPriorityInfo(priorityId) {
    return PRIORITY_LABELS[priorityId] || { label: 'Inconnu', color: 'gray' }
  }

   return {
    // state
    tickets, selectedTicket, ticketItems, ticketCosts,
    loading, loadingDetails, error,
    search, filterStatus, filterType,
    // getters
    filteredTickets, totalByStatus,
    // actions
    loadTickets, selectTicket, closeTicket,
    getStatusInfo, getTypeInfo, getPriorityInfo,
  }


 
})