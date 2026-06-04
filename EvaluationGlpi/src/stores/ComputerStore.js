import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'

export const useComputerStore = defineStore('computers', () => {

  // ---- STATE ----
  const computers   = ref([])
  const loading     = ref(false)
  const error       = ref(null)
  const searchQuery = ref('')
  const currentPage = ref(0)
  const pageSize    = ref(20)
  const totalCount  = ref(0)

  // ---- GETTERS ----
  const filteredComputers = computed(() => {
    if (!searchQuery.value) return computers.value
    const q = searchQuery.value.toLowerCase()
    return computers.value.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.serial?.toLowerCase().includes(q) ||
      c.manufacturers_id?.toLowerCase().includes(q)
    )
  })

  const totalPages = computed(() =>
    Math.ceil(totalCount.value / pageSize.value)
  )

  // ---- ACTIONS ----

  /**
   * Charge la liste des ordinateurs
   */
  async function fetchComputers() {
    loading.value = true
    error.value   = null

    try {
      const data = await GlpiClient.getComputers({
        start: currentPage.value * pageSize.value,
        limit: pageSize.value,
      })

      computers.value = Array.isArray(data) ? data : []
      totalCount.value = computers.value.length

    } catch (err) {
      error.value = err.response?.data?.message
        || err.message
        || 'Erreur lors du chargement des ordinateurs'
    } finally {
      loading.value = false
    }
  }

  /**
   * Change de page
   */
  function setPage(page) {
    currentPage.value = page
    fetchComputers()
  }

  /**
   * Remet à zéro les filtres
   */
  function resetFilters() {
    searchQuery.value = ''
    currentPage.value = 0
  }

  return {
    // state
    computers,
    loading,
    error,
    searchQuery,
    currentPage,
    pageSize,
    totalCount,
    // getters
    filteredComputers,
    totalPages,
    // actions
    fetchComputers,
    setPage,
    resetFilters,
  }
})