import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'
import LocalClient from '@/api/localClient'

export const useCostsByTypeStore = defineStore('costsByType', () => {

  // ============ STATE ============
  const tickets     = ref([])
  const ticketItems = ref({})
  const ticketCosts = ref({})
  const superCouts  = ref([])
  const loading     = ref(false)
  const loadingLabel = ref('')
  const error       = ref(null)

  // ============ ACTIONS ============
  async function loadAll() {
    loading.value = true
    error.value = null
    loadingLabel.value = 'Chargement des tickets...'

    try {
      const allTickets = await GlpiClient.getTickets({
        start: 0, limit: 500, sort: 'id', order: 'DESC'
      })
      tickets.value = allTickets

      loadingLabel.value = 'Chargement des superCouts...'
      superCouts.value = await LocalClient.getAllCouts()

      loadingLabel.value = 'Chargement des items et coûts...'
      const itemsMap = {}
      const costsMap = {}

      let count = 0
      await Promise.all(
        allTickets.map(async (ticket) => {
          try {
            const items = await GlpiClient.getTicketItems(ticket.id)
            itemsMap[ticket.id] = items

            const costs = await GlpiClient.getTicketCosts(ticket.id)
            const totalGlpi = costs.reduce((sum, c) => {
              const time = parseFloat(c.cost_time) || 0
              const fixed = parseFloat(c.cost_fixed) || 0
              const material = parseFloat(c.cost_material) || 0
              const seconds = parseInt(c.actiontime) || 0
              const timeCost = (seconds / 3600) * time
              return sum + timeCost + fixed + material
            }, 0)
            costsMap[ticket.id] = totalGlpi

            count++
            loadingLabel.value = `Chargement... (${count}/${allTickets.length})`
          } catch (e) {
            console.warn(`⚠️ Ticket #${ticket.id}`, e.message)
            itemsMap[ticket.id] = []
            costsMap[ticket.id] = 0
          }
        })
      )

      ticketItems.value = itemsMap
      ticketCosts.value = costsMap

    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
      loadingLabel.value = ''
    }
  }

  // ============ GETTERS ============

  /**
   * ⭐ LISTE DÉTAILLÉE : chaque coût individuel avec son type
   * Une ligne par coût × item
   */
  const detailedCosts = computed(() => {
    const result = []

    superCouts.value.forEach(cout => {
      const ticketId = cout.ticket
      const items = ticketItems.value[ticketId] || []
      const nbItems = items.length

      if (nbItems === 0) return

      // Diviser ce coût par le nombre d'items du ticket
      const coutParItem = Number(cout.cout) / nbItems

      // Une ligne par item
      items.forEach(item => {
        result.push({
          coutId: cout.id,
          ticketId: ticketId,
          ticketName: tickets.value.find(t => t.id === ticketId)?.name || '—',
          itemtype: item.itemtype,
          itemName: item.details?.name || `#${item.items_id}`,
          type: cout.type || 'SAISI',  // SAISI ou REOUVERTURE
          montantTotal: Number(cout.cout),
          montantParItem: coutParItem,
          nbItems: nbItems,
          createdAt: cout.createdAt,
        })
      })
    })

    // Trier par date DESC (plus récent en premier)
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })

  /**
   * Vue AGRÉGÉE par type (Computer, Monitor, etc.)
   */
  const costsByType = computed(() => {
    const result = {}

    tickets.value.forEach(ticket => {
      const items = ticketItems.value[ticket.id] || []
      const totalCoutGlpi = ticketCosts.value[ticket.id] || 0

      const superCoutsDuTicket = superCouts.value
        .filter(c => c.ticket === ticket.id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

      const coutSaisi = superCoutsDuTicket
        .filter(c => c.type === 'SAISI')
        .reduce((sum, c) => sum + (Number(c.cout) || 0), 0)

      const coutReouverture = superCoutsDuTicket
        .filter(c => c.type === 'REOUVERTURE')
        .reduce((sum, c) => sum + (Number(c.cout) || 0), 0)

      const superCoutTicket = coutSaisi + coutReouverture
      const nbItems = items.length
      if (nbItems === 0) return

      const coutGlpiParItem = totalCoutGlpi / nbItems
      const coutSaisiParItem = coutSaisi / nbItems
      const coutReouvertureParItem = coutReouverture / nbItems
      const superCoutParItem = superCoutTicket / nbItems

      items.forEach(item => {
        const type = item.itemtype

        if (!result[type]) {
          result[type] = {
            type,
            count: 0,
            coutGlpi: 0,
            coutSaisi: 0,
            coutReouverture: 0,
            superCout: 0,
            total: 0,
            tickets: new Set(),
          }
        }

        result[type].count++
        result[type].coutGlpi += coutGlpiParItem
        result[type].coutSaisi += coutSaisiParItem
        result[type].coutReouverture += coutReouvertureParItem
        result[type].superCout += superCoutParItem
        result[type].total += (coutGlpiParItem + superCoutParItem)
        result[type].tickets.add(ticket.id)
      })
    })

    return Object.values(result).map(r => ({
      ...r,
      ticketsCount: r.tickets.size,
      tickets: undefined,
    }))
  })

  // ============ TOTAUX ============
  const grandTotal = computed(() =>
    costsByType.value.reduce((sum, t) => sum + t.total, 0)
  )

  const totalGlpi = computed(() =>
    costsByType.value.reduce((sum, t) => sum + t.coutGlpi, 0)
  )

  const totalSuperCout = computed(() =>
    costsByType.value.reduce((sum, t) => sum + t.superCout, 0)
  )

  const totalCoutSaisi = computed(() =>
    costsByType.value.reduce((sum, t) => sum + t.coutSaisi, 0)
  )

  const totalCoutReouverture = computed(() =>
    costsByType.value.reduce((sum, t) => sum + t.coutReouverture, 0)
  )

  const totalItems = computed(() =>
    costsByType.value.reduce((sum, t) => sum + t.count, 0)
  )

  return {
    tickets, ticketItems, ticketCosts, superCouts,
    loading, loadingLabel, error,
    costsByType, detailedCosts,
    grandTotal, totalGlpi, totalSuperCout,
    totalCoutSaisi, totalCoutReouverture, totalItems,
    loadAll,
  }
})