import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'
import { ITEM_TYPES,getItemDocuments } from '@/api/glpi/FrontOffice/items'

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

  // ---- TRI ----
  const sortBy    = ref('name')
  const sortOrder = ref('asc')

  // ---- STATE ----
const selectedItemDocuments = ref([])
const loadingDocuments = ref(false)

  // ---- PAGINATION ----
  const currentPage = ref(1)
  const perPage     = ref(20)

  // ---- GETTERS ----

  // ---- GETTERS pour les filtres ----

    const uniqueStatuses = computed(() => {
      const set = new Set()
      items.value.forEach(i => {
        const val = getFieldValue(i.states_id)
        if (val) set.add(val)
      })
      return ['all', ...Array.from(set).sort()]
    })

    const uniqueLocations = computed(() => {
      const set = new Set()
      items.value.forEach(i => {
        const val = getFieldValue(i.locations_id)
        if (val) set.add(val)
      })
      return ['all', ...Array.from(set).sort()]
    })

    const uniqueManufacturers = computed(() => {
      const set = new Set()
      items.value.forEach(i => {
        const val = getFieldValue(i.manufacturers_id)
        if (val) set.add(val)
      })
      return ['all', ...Array.from(set).sort()]
    })

    const uniqueUsers = computed(() => {
      const set = new Set()
      items.value.forEach(i => {
        const val = getFieldValue(i.users_id)
        if (val) set.add(val)
      })
      return ['all', ...Array.from(set).sort()]
    })

    // ---- HELPER pour gérer string OU objet ----
    function getFieldValue(field) {
      if (!field) return null
      if (typeof field === 'string') return field
      if (typeof field === 'object') return field.name || null
      return null
    }


    const filteredItems = computed(() => {
        let list = items.value

        if (search.value) {
          const s = search.value.toLowerCase()
          list = list.filter(i =>
            i.name?.toLowerCase().includes(s) ||
            i.serial?.toLowerCase().includes(s) ||
            i.otherserial?.toLowerCase().includes(s) ||
            String(i.id).includes(s)
          )
        }

        if (filterType.value !== 'all') {
          list = list.filter(i => i._itemtype === filterType.value)
        }

        // ✅ Utilise getFieldValue
        if (filterStatus.value !== 'all') {
          list = list.filter(i => getFieldValue(i.states_id) === filterStatus.value)
        }
        if (filterLocation.value !== 'all') {
          list = list.filter(i => getFieldValue(i.locations_id) === filterLocation.value)
        }
        if (filterManufacturer.value !== 'all') {
          list = list.filter(i => getFieldValue(i.manufacturers_id) === filterManufacturer.value)
        }

        list = [...list].sort((a, b) => {
          const aVal = getSortValue(a, sortBy.value)
          const bVal = getSortValue(b, sortBy.value)
          const result = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
          return sortOrder.value === 'asc' ? result : -result
        })

        return list
      })

      // ---- HELPER tri ----
      function getSortValue(item, field) {
        if (field === 'type')         return item._itemtype || ''
        if (field === 'name')         return item.name || ''
        if (field === 'serial')       return item.serial || ''
        if (field === 'status')       return getFieldValue(item.states_id) || ''
        if (field === 'location')     return getFieldValue(item.locations_id) || ''
        if (field === 'manufacturer') return getFieldValue(item.manufacturers_id) || ''
        if (field === 'user')         return getFieldValue(item.users_id) || ''
        return item[field] || ''
      }

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

 

  // ---- ACTIONS ----
async function selectItem(item) {
  selectedItem.value = item
  selectedItemDocuments.value = []
  loadingDocuments.value = true

  try {
    
    selectedItemDocuments.value = await getItemDocuments(item._itemtype, item.id)
  } catch (err) {
    console.error('Erreur chargement documents', err)
  } finally {
    loadingDocuments.value = false
  }
}

  async function loadItems() {
    loading.value = true
    error.value = null

    try {
      items.value = await GlpiClient.fetchAllTypesItems((progress) => {
        loadingLabel.value = `Chargement ${progress.label}... (${progress.current}/${progress.total})`
      })
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
      loadingLabel.value = ''
    }
  }

  // function selectItem(item) {
  //   selectedItem.value = item
  // }

  function closeItem() {
    selectedItem.value = null
  }

  function resetFilters() {
    search.value = ''
    filterType.value = 'all'
    filterStatus.value = 'all'
    filterLocation.value = 'all'
    filterManufacturer.value = 'all'
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
    filterManufacturer,
    sortBy, sortOrder, currentPage, perPage,
    // getters
    filteredItems, paginatedItems, totalPages,
    statsByType,
    uniqueStatuses, uniqueLocations, uniqueManufacturers, uniqueUsers,
    // actions
    loadItems, selectItem, closeItem,
    resetFilters, setSorting, goToPage,
     selectedItemDocuments,
  loadingDocuments,
  }
})