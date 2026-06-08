import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'

export const useDashboardStore = defineStore('dashboard', () => {

  // ---- STATE ----
  const assets        = ref([])
  const totalAssets   = ref(0)
  const tickets       = ref({ total: 0, byStatus: [], byType: [], byPriority: [], raw: [] })
  const loading       = ref(false)
  const loadingLabel  = ref('')
  const error         = ref(null)
  const lastUpdate    = ref(null)

  // ---- GETTERS ----
  const assetsWithItems = computed(() =>
    assets.value.filter(a => a.count > 0)
  )

  const topAssets = computed(() =>
    [...assets.value].sort((a, b) => b.count - a.count).slice(0, 5)
  )

  // ---- ACTIONS ----

  async function loadDashboard() {
    loading.value = true
    error.value   = null

    try {
      // 1. Charger stats des assets
      loadingLabel.value = 'Chargement des assets...'
      const assetsResult = await GlpiClient.getAssetsStats((progress) => {
        loadingLabel.value = progress.label
      })
      assets.value      = assetsResult.stats
      totalAssets.value = assetsResult.total

      // 2. Charger stats des tickets
      loadingLabel.value = 'Chargement des tickets...'
      tickets.value = await GlpiClient.getTicketsStats()

      lastUpdate.value = new Date()

    } catch (err) {
      error.value = err.message || 'Erreur lors du chargement'
      console.error('Dashboard error:', err)
    } finally {
      loading.value = false
      loadingLabel.value = ''
    }
  }

  function reset() {
    assets.value = []
    totalAssets.value = 0
    tickets.value = { total: 0, byStatus: [], byType: [], byPriority: [], raw: [] }
    error.value = null
    lastUpdate.value = null
  }

  return {
    // state
    assets, totalAssets, tickets,
    loading, loadingLabel, error, lastUpdate,
    // getters
    assetsWithItems, topAssets,
    // actions
    loadDashboard, reset,
  }
})