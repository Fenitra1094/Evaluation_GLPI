import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'
import { ITEM_TYPES } from '@/api/glpi/FrontOffice/items'

export const useItemsStore = defineStore('items', () => {

  // ---- STATE ----
  const items          = ref([])
  const selectedItem   = ref(null)
  const loading        = ref(false)
  const loadingLabel   = ref('')
  const error          = ref(null)

  // ---- FILTRES ----
  const search         = ref('')
  const filterType     = ref('all')
  const filterStatus   = ref('all')
  const filterLocation = ref('all')
  const filterManufacturer = ref('all')
  const filterUser     = ref('all')

  // ---- TRI ----
  const sortBy    = ref('name')
  const sortOrder = ref('asc')

  // ---- PAGINATION ----
  const currentPage = ref(1)
  const perPage     = ref(20)

  // ---- GETTERS ----

  /**
   * Liste des valeurs uniques pour les filtres
   */
  const uniqueStatuses = computed(() => {
    const set = new Set()
    items.value.forEach(i => {
      if (i.states_id?.name) set.add(i.states_id.name)
    })
    return ['all', ...Array.from(set).sort()]
  })

  const uniqueLocations = computed(() => {
    const set = new Set()
    items.value.forEach(i => {
      if (i.locations_id?.name) set.add(i.locations_id.name)
    })
    return ['all', ...Array.from(set).sort()]
  })

  const uniqueManufacturers = computed(() => {
    const set = new Set()
    items.value.forEach(i => {
      if (i.manufacturers_id?.name) set.add(i.manufacturers_id.name)
    })
    return ['all', ...Array.from(set).sort()]
  })

  const uniqueUsers = computed(() => {
    const set = new Set()
    items.value.forEach(i => {
      if (i.users_id?.name) set.add(i.users_id.name)
    })
    return ['all', ...Array.from(set).sort()]
  })

  /**
   * Liste filtrée
   */
  const filteredItems = computed(() => {
    let list = items.value

    // Recherche textuelle (sur plusieurs champs)
    if (search.value) {
      const s = search.value.toLowerCase()
      list = list.filter(i =>
        i.name?.toLowerCase().includes(s) ||
        i.serial?.toLowerCase().includes(s) ||
        i.otherserial?.toLowerCase().includes(s) ||
        String(i.id).includes(s)
      )
    }

    // Filtre type
    if (filterType.value !== 'all') {
      list = list.filter(i => i._itemtype === filterType.value)
    }

    // Filtre statut
    if (filterStatus.value !== 'all') {
      list = list.filter(i => i.states_id?.name === filterStatus.value)
    }

    // Filtre location
    if (filterLocation.value !== 'all') {
      list = list.filter(i => i.locations_id?.name === filterLocation.value)
    }

    // Filtre fabricant
    if (filterManufacturer.value !== 'all') {
      list = list.filter(i => i.manufacturers_id?.name === filterManufacturer.value)
    }

    // Filtre utilisateur
    if (filterUser.value !== 'all') {
      list = list.filter(i => i.users_id?.name === filterUser.value)
    }

    // Tri
    list = [...list].sort((a, b) => {
      const aVal = getSortValue(a, sortBy.value)
      const bVal = getSortValue(b, sortBy.value)
      const result = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      return sortOrder.value === 'asc' ? result : -result
    })

    return list
  })

  /**
   * Items pour la page courante
   */
  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredItems.value.slice(start, start + perPage.value)
  })

  /**
   * Nombre total de pages
   */
  const totalPages = computed(() => {
    return Math.ceil(filteredItems.value.length / perPage.value)
  })

  /**
   * Statistiques par type
   */
  const statsByType = computed(() => {
    const stats = {}
    ITEM_TYPES.forEach(t => {
      stats[t.key] = items.value.filter(i => i._itemtype === t.key).length
    })
    return stats
  })

  // ---- HELPERS ----

  function getSortValue(item, field) {
    if (field === 'type')         return item._itemtype || ''
    if (field === 'name')         return item.name || ''
    if (field === 'serial')       return item.serial || ''
    if (field === 'status')       return item.states_id?.name || ''
    if (field === 'location')     return item.locations_id?.name || ''
    if (field === 'manufacturer') return item.manufacturers_id?.name || ''
    if (field === 'user')         return item.users_id?.name || ''
    return item[field] || ''
  }

  // ---- ACTIONS ----

  async function loadItems() {
    loading.value = true
    error.value = null

    try {
      items.value = await GlpiClient.getAllItems((progress) => {
        loadingLabel.value = `Chargement ${progress.label}... (${progress.current}/${progress.total})`
      })
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
      loadingLabel.value = ''
    }
  }

  function selectItem(item) {
    selectedItem.value = item
  }

  function closeItem() {
    selectedItem.value = null
  }

  function resetFilters() {
    search.value = ''
    filterType.value = 'all'
    filterStatus.value = 'all'
    filterLocation.value = 'all'
    filterManufacturer.value = 'all'
    filterUser.value = 'all'
    currentPage.value = 1
  }

  function setSorting(field) {
    if (sortBy.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = field
      sortOrder.value = 'asc'
    }
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  return {
    // state
    items, selectedItem, loading, loadingLabel, error,
    search, filterType, filterStatus, filterLocation,
    filterManufacturer, filterUser,
    sortBy, sortOrder, currentPage, perPage,
    // getters
    filteredItems, paginatedItems, totalPages,
    statsByType,
    uniqueStatuses, uniqueLocations, uniqueManufacturers, uniqueUsers,
    // actions
    loadItems, selectItem, closeItem,
    resetFilters, setSorting, goToPage,
  }
})