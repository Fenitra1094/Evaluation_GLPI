import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'
import LocalClient from '@/api/localClient'

export const useCostsByTypeStore = defineStore('costsByType', () => {

  // ============ STATE ============
  const allCouts    = ref([])              // tous les coûts SQLite
  const itemsCache  = ref({})              // cache { "Computer-3": { name, ... } }
  const loading     = ref(false)
  const loadingLabel = ref('')
  const error       = ref(null)

  // Catégorie sélectionnée pour voir les détails
  const selectedCategory = ref(null)

  // ============ ACTIONS ============

  /**
   * Charge tous les coûts depuis SQLite
   */
  async function loadAll() {
    loading.value = true
    error.value = null
    loadingLabel.value = 'Chargement des coûts...'

    try {
      // 1. Charger tous les coûts SQLite
      allCouts.value = await LocalClient.getAllCouts()

      // 2. Charger les noms des items en parallèle
      loadingLabel.value = 'Chargement des éléments...'
      await loadItemsDetails()

    } catch (err) {
      error.value = err.message
      console.error('❌ Erreur loadAll', err)
    } finally {
      loading.value = false
      loadingLabel.value = ''
    }
  }

  /**
   * Charge les noms des items via l'API GLPI
   */
  async function loadItemsDetails() {
    const uniquePairs = new Set()
    allCouts.value.forEach(c => {
      if (c.category && c.item) {
        uniquePairs.add(`${c.category}|${c.item}`)
      }
    })

    const promises = []
    for (const pair of uniquePairs) {
      const [itemtype, itemId] = pair.split('|')
      const key = `${itemtype}-${itemId}`

      if (itemsCache.value[key]) continue

      promises.push(
        GlpiClient.getItemById(itemtype, parseInt(itemId))
          .then(data => {
            if (data) {
              itemsCache.value[key] = {
                name: data.name || `#${itemId}`,
                itemtype,
                id: itemId,
              }
            }
          })
          .catch(() => {
            itemsCache.value[key] = { name: `#${itemId}`, itemtype, id: itemId }
          })
      )
    }

    await Promise.all(promises)
  }

  // ============ GETTERS ============

  /**
   * Vue AGRÉGÉE par catégorie (Computer, Monitor, etc.)
   */
  const costsByCategory = computed(() => {
    const result = {}

    allCouts.value.forEach(cout => {
      const category = cout.category
      if (!category) return

      if (!result[category]) {
        result[category] = {
          category,
          total: 0,
          count: 0,
          items: new Set(),
          totalGlpi: 0,
          totalSaisi: 0,
          totalReouverture: 0,
          totalCancel: 0,
        }
      }

      const montant = Number(cout.cout) || 0

      result[category].total += montant
      result[category].count++
      result[category].items.add(cout.item)

      switch (cout.type) {
        case 'GLPI':        result[category].totalGlpi        += montant; break
        case 'SAISI':       result[category].totalSaisi       += montant; break
        case 'REOUVERTURE': result[category].totalReouverture += montant; break
        case 'CANCEL':      result[category].totalCancel      += montant; break
      }
    })

    return Object.values(result).map(r => ({
      ...r,
      itemsCount: r.items.size,
      items: undefined,
    }))
  })

  /**
   * Détails groupés par ITEM pour une catégorie donnée
   */
  const detailsForSelectedCategory = computed(() => {
    if (!selectedCategory.value) return []

    const coutsCategory = allCouts.value.filter(
      c => c.category === selectedCategory.value
    )

    const grouped = {}

    coutsCategory.forEach(cout => {
      const itemId = cout.item
      const key = `${cout.category}-${itemId}`

      if (!grouped[itemId]) {
        grouped[itemId] = {
          itemId,
          itemName: itemsCache.value[key]?.name || `#${itemId}`,
          itemtype: cout.category,
          total: 0,
          mouvements: [],
        }
      }

      const montant = Number(cout.cout) || 0
      grouped[itemId].total += montant

      grouped[itemId].mouvements.push({
        id: cout.id,
        type: cout.type,
        cout: montant,
        createdAt: cout.createdAt,
      })
    })

    Object.values(grouped).forEach(item => {
      item.mouvements.sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt)
      )
    })

    return Object.values(grouped).sort((a, b) => b.total - a.total)
  })

  // ============ TOTAUX ============

  const grandTotal = computed(() =>
    allCouts.value.reduce((sum, c) => sum + (Number(c.cout) || 0), 0)
  )

  const totalByType = computed(() => {
    const result = { GLPI: 0, SAISI: 0, REOUVERTURE: 0, CANCEL: 0 }
    allCouts.value.forEach(c => {
      const montant = Number(c.cout) || 0
      if (result[c.type] !== undefined) {
        result[c.type] += montant
      }
    })
    return result
  })

  // ============ ACTIONS UI ============

  function selectCategory(category) {
    selectedCategory.value = category
  }

  function clearSelection() {
    selectedCategory.value = null
  }

  return {
    allCouts, loading, loadingLabel, error,
    selectedCategory,
    costsByCategory, detailsForSelectedCategory,
    grandTotal, totalByType,
    loadAll, selectCategory, clearSelection,
  }
})