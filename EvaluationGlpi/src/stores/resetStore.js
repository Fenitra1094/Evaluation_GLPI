import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'

// =========================================================
// WHITELIST DE PROTECTION
// =========================================================
// Ces ressources ne seront JAMAIS supprimées, même par
// l'action "Tout réinitialiser". Elles sont critiques au
// fonctionnement de GLPI (authentification, droits, config).
// =========================================================
const PROTECTED_RESOURCES = new Set([
  // Utilisateurs et droits
  'User',
  'Profile',
  'ProfileRight',
  'Profile_User',
 // 'Group',
  'Group_User',
  'UserEmail',

  // Entités et configuration
  'Entity',
  'Config',
  'DisplayPreference',
  'State',

  // API et sessions
  'APIClient',
  'Session',
  'Log',

  // Authentification externe
  'AuthLDAP',
  'AuthMail',

  // Tâches planifiées
  'CronTask',

  // Notifications (templates système)
  'Notification',
  'NotificationTemplate',
  'NotificationTarget',

  // Catégories et types système
  'RequestType',
  'TaskCategory',
  'SolutionType',
  'DocumentCategory',
  'DocumentType',
  'ITILCategory',

  // Calendriers et jours fériés
  'Calendar',
  'CalendarSegment',
  'Holiday',

  // Tableaux de bord
  'Dashboard',
])

export const useResetStore = defineStore('reset', () => {

  // ---- STATE ----
  const resources    = ref([])
  const loading      = ref(false)
  const processing   = ref(false)
  const progress     = ref(null)
  const lastReport   = ref(null)
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
   * Découvre dynamiquement les ressources via /doc.json
   * puis charge les counts via l'API v1
   */
  async function loadResources() {
    loading.value = true
    error.value   = null

    try {
      // 1. Découverte dynamique via OpenAPI
      const discovered = await GlpiClient.discoverResources()

      // 2. Filtrer les ressources protégées
      const usable = discovered.filter(r => !PROTECTED_RESOURCES.has(r.key))

      // 3. Initialiser la liste
      resources.value = usable.map(r => ({
        key:       r.key,
        label:     r.key,
        category:  r.category,
        count:     0,
        loading:   true,
        selected:  false,
        available: true,
      }))

      // 4. Charger les counts par batch de 5 (pour ne pas surcharger GLPI)
      const BATCH_SIZE = 5
      for (let i = 0; i < resources.value.length; i += BATCH_SIZE) {
        const batch = resources.value.slice(i, i + BATCH_SIZE)
        await Promise.all(
          batch.map(async (r) => {
            try {
              r.count = await GlpiClient.countItems(r.key)
            } catch (e) {
              r.count = 0
              r.available = false
            } finally {
              r.loading = false
            }
          })
        )
      }

      // 5. Retirer les ressources non accessibles via API v1
      resources.value = resources.value.filter(r => r.available)

    } catch (err) {
      error.value = err.message || 'Erreur lors de la découverte'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Coche/décoche toutes les ressources
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

      // Recharger les counts après purge
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
   * Supprime TOUTES les ressources disponibles
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