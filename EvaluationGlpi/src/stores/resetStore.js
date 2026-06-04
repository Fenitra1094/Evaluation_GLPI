import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'

// Liste fixe des ressources réinitialisables
export const AVAILABLE_RESOURCES = [
  { key: 'Computer',          label: 'Ordinateurs',          category: 'Parc' },
  { key: 'Monitor',           label: 'Écrans',               category: 'Parc' },
  { key: 'NetworkEquipment',  label: 'Matériel réseau',      category: 'Parc' },
  { key: 'Peripheral',        label: 'Périphériques',        category: 'Parc' },
  { key: 'Phone',             label: 'Téléphones',           category: 'Parc' },
  { key: 'Printer',           label: 'Imprimantes',          category: 'Parc' },
  { key: 'Software',          label: 'Logiciels',            category: 'Parc' },
  { key: 'SoftwareLicense',   label: 'Licences logicielles', category: 'Parc' },
  { key: 'Cartridge',         label: 'Cartouches',           category: 'Parc' },
  { key: 'Consumable',        label: 'Consommables',         category: 'Parc' },
  { key: 'Line',              label: 'Lignes téléphoniques', category: 'Parc' },

  { key: 'Ticket',            label: 'Tickets',              category: 'Assistance' },
  { key: 'Problem',           label: 'Problèmes',            category: 'Assistance' },
  { key: 'Change',            label: 'Changements',          category: 'Assistance' },

  { key: 'Budget',            label: 'Budgets',              category: 'Gestion' },
  { key: 'Supplier',          label: 'Fournisseurs',         category: 'Gestion' },
  { key: 'Contact',           label: 'Contacts',             category: 'Gestion' },
  { key: 'Contract',          label: 'Contrats',             category: 'Gestion' },
  { key: 'Document',          label: 'Documents',            category: 'Gestion' },

  { key: 'Reminder',          label: 'Notes',                category: 'Outils' },
  { key: 'RSSFeed',           label: 'Flux RSS',             category: 'Outils' },
  { key: 'KnowbaseItem',      label: 'Base de connaissance', category: 'Outils' },
  { key: 'Project',           label: 'Projets',              category: 'Outils' },
]

export const useResetStore = defineStore('reset', () => {

  // ---- STATE ----
  const resources    = ref([])      // [{key, label, count, loading, selected}]
  const loading      = ref(false)
  const processing   = ref(false)
  const progress     = ref(null)    // {resource, current, total, success, failed}
  const lastReport   = ref(null)    // {totalSuccess, totalFailed, details}
  const error        = ref(null)

  // ---- GETTERS ----
  const selectedResources = computed(() =>
    resources.value.filter(r => r.selected)
  )

  const hasSelection = computed(() =>
    selectedResources.value.length > 0
  )

  const totalElements = computed(() =>
    resources.value.reduce((sum, r) => sum + (r.count || 0), 0)
  )

  const groupedByCategory = computed(() => {
    const groups = {}
    for (const r of resources.value) {
      if (!groups[r.category]) groups[r.category] = []
      groups[r.category].push(r)
    }
    return groups
  })

  // ---- ACTIONS ----

  /**
   * Charge la liste des ressources avec leur count
   */
  async function loadResources() {
    loading.value = true
    error.value   = null

    // Initialiser
    resources.value = AVAILABLE_RESOURCES.map(r => ({
      ...r,
      count: 0,
      loading: true,
      selected: false,
    }))

    // Charger les counts en parallèle
    await Promise.all(
      resources.value.map(async (r) => {
        try {
          r.count = await GlpiClient.countItems(r.key)
        } catch (e) {
          r.count = 0
        } finally {
          r.loading = false
        }
      })
    )

    loading.value = false
  }

  /**
   * Coche/décoche tout
   */
  function toggleAll(checked) {
    resources.value.forEach(r => { r.selected = checked })
  }

  /**
   * Lance la purge d'une liste de ressources
   */
  async function purgeResources(resourcesToProcess) {
    processing.value = true
    progress.value   = null
    lastReport.value = null
    error.value      = null

    const details = []
    let totalSuccess = 0
    let totalFailed  = 0

    try {
      for (const resource of resourcesToProcess) {
        const report = await GlpiClient.purgeResource(
          resource.key,
          (p) => { progress.value = { ...p, label: resource.label } }
        )

        details.push({
          ...report,
          label: resource.label,
        })

        totalSuccess += report.success
        totalFailed  += report.failed
      }

      lastReport.value = { totalSuccess, totalFailed, details }

      // Recharger les counts
      await loadResources()

    } catch (err) {
      error.value = err.message || 'Erreur lors de la réinitialisation'
    } finally {
      processing.value = false
      progress.value   = null
    }
  }

  /**
   * Supprime uniquement la sélection
   */
  async function purgeSelected() {
    await purgeResources(selectedResources.value)
  }

  /**
   * Supprime TOUTES les ressources
   */
  async function purgeAll() {
    await purgeResources(resources.value)
  }

  return {
    // state
    resources,
    loading,
    processing,
    progress,
    lastReport,
    error,
    // getters
    selectedResources,
    hasSelection,
    totalElements,
    groupedByCategory,
    // actions
    loadResources,
    toggleAll,
    purgeSelected,
    purgeAll,
  }
})