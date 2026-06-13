import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'
import LocalClient from '@/api/localClient'

export const useCostsByTypeStore = defineStore('costsByType', () => {

  // ============ STATE ============
  const tickets     = ref([])    // Tous les tickets GLPI
  const ticketItems = ref({})    // { ticketId: [items] }
  const ticketCosts = ref({})    // { ticketId: totalCoutGlpi }
  const superCouts  = ref([])    // SuperCouts SQLite
  const loading     = ref(false)
  const loadingLabel = ref('')
  const error       = ref(null)

  // ============ ACTIONS ============

  async function loadAll() {
    loading.value = true
    error.value = null
    loadingLabel.value = 'Chargement des tickets...'

    try {
      // 1. Charger tous les tickets
      const allTickets = await GlpiClient.getTickets({
        start: 0,
        limit: 500,
        sort: 'id',
        order: 'DESC'
      })
      tickets.value = allTickets
      console.log(`✅ ${allTickets.length} tickets chargés`)

      // 2. Charger les superCouts SQLite
      loadingLabel.value = 'Chargement des superCouts...'
      superCouts.value = await LocalClient.getAllCouts()
      console.log(`✅ ${superCouts.value.length} superCouts chargés`)

      // 3. Pour chaque ticket : items + coûts GLPI
      loadingLabel.value = 'Chargement des items et coûts...'
      const itemsMap = {}
      const costsMap = {}

      let count = 0
      await Promise.all(
        allTickets.map(async (ticket) => {
          try {
            // Items liés
            const items = await GlpiClient.getTicketItems(ticket.id)
            itemsMap[ticket.id] = items

            // Coûts GLPI
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
      console.error('❌', err)
    } finally {
      loading.value = false
      loadingLabel.value = ''
    }
  }

  // ============ GETTERS ============

  /**
   * ⭐ LA LOGIQUE PRINCIPALE
   * Regroupe les coûts PAR TYPE d'item
   */
  const costsByType = computed(() => {
    const result = {}   // { 'Computer': { count, glpi, super, total }, ... }

    tickets.value.forEach(ticket => {
      const items = ticketItems.value[ticket.id] || []
      const totalCoutGlpi = ticketCosts.value[ticket.id] || 0

      // SuperCout SQLite pour ce ticket
      const superCoutTicket = superCouts.value
        .filter(c => c.ticket === ticket.id)
        .reduce((sum, c) => sum + (Number(c.cout) || 0), 0)

      const nbItems = items.length

      if (nbItems === 0) return

      // ⭐ DIVISION : coût total / nombre d'items
      const coutGlpiParItem = totalCoutGlpi / nbItems
      const superCoutParItem = superCoutTicket / nbItems

      // ⭐ Pour chaque item, ajouter au TYPE correspondant
      items.forEach(item => {
        const type = item.itemtype

        if (!result[type]) {
          result[type] = {
            type,
            count: 0,
            coutGlpi: 0,
            superCout: 0,
            total: 0,
            tickets: new Set(),   // Pour compter les tickets uniques
          }
        }

        result[type].count++
        result[type].coutGlpi += coutGlpiParItem
        result[type].superCout += superCoutParItem
        result[type].total += (coutGlpiParItem + superCoutParItem)
        result[type].tickets.add(ticket.id)
      })
    })

    // Convertir en tableau et finaliser
    return Object.values(result).map(r => ({
      ...r,
      ticketsCount: r.tickets.size,
      tickets: undefined,   // Enlever le Set
    }))
  })

  /** Total général */
  const grandTotal = computed(() =>
    costsByType.value.reduce((sum, t) => sum + t.total, 0)
  )

  const totalGlpi = computed(() =>
    costsByType.value.reduce((sum, t) => sum + t.coutGlpi, 0)
  )

  const totalSuperCout = computed(() =>
    costsByType.value.reduce((sum, t) => sum + t.superCout, 0)
  )

  const totalItems = computed(() =>
    costsByType.value.reduce((sum, t) => sum + t.count, 0)
  )

  return {
    tickets, ticketItems, ticketCosts, superCouts,
    loading, loadingLabel, error,
    costsByType, grandTotal, totalGlpi, totalSuperCout, totalItems,
    loadAll,
  }
})