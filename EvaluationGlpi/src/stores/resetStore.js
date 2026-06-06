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
  // 'User',
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

  // 🆕 Relations système
  'DomainRelation',
])

const PROTECTED_USERS = new Set([
  'glpi',         // ← Ton compte admin
  'glpi-system',  // ← Compte interne GLPI (logs, cron, notifications)
])

/**
 * Purge spéciale pour les Users
 * Supprime tous les users SAUF ceux dans PROTECTED_USERS
 */
async function purgeUsersExceptSystem(onProgress = null) {
  // 1. Récupérer tous les users
  const allUsers = await GlpiClient.getAllItems('User')

  // 2. Filtrer pour récupérer ceux à supprimer
  // ⚠️ On a besoin du nom, donc on doit récupérer plus que juste l'id
  const usersToDelete = []
  const total = allUsers.length

  // Récupérer les noms (par batch pour aller plus vite)
  for (let i = 0; i < allUsers.length; i++) {
    try {
      const user = await GlpiClient.getItemById('User', allUsers[i].id)
      if (!PROTECTED_USERS.has(user.name)) {
        usersToDelete.push({ id: user.id, name: user.name })
      }
    } catch (err) {
      console.warn(`Erreur lecture user ${allUsers[i].id}`)
    }
  }

  console.log(`👤 ${usersToDelete.length} users à supprimer sur ${total}`)

  // 3. Supprimer ceux à supprimer
  let success = 0
  let failed  = 0

  for (let i = 0; i < usersToDelete.length; i++) {
    const u = usersToDelete[i]
    try {
      await GlpiClient.deleteItem('User', u.id)
      success++
      console.log(`🗑️ User supprimé : ${u.name}`)
    } catch (err) {
      failed++
      console.error(`❌ Erreur suppression user ${u.name}`)
    }

    if (onProgress) {
      onProgress({
        resource: 'User',
        current : i + 1,
        total   : usersToDelete.length,
        success,
        failed,
      })
    }
  }

  return {
    resource: 'User',
    total   : usersToDelete.length,
    success,
    failed,
  }
}

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

    // 4. Charger les counts par batch de 5
    const BATCH_SIZE = 5
    for (let i = 0; i < resources.value.length; i += BATCH_SIZE) {
      const batch = resources.value.slice(i, i + BATCH_SIZE)

      await Promise.all(
        batch.map(async (r) => {
          try {
            r.count     = await GlpiClient.countItems(r.key)
            r.available = true
          } catch (e) {
            // ✅ Silencieux - on marque juste comme non dispo
            r.count     = 0
            r.available = false
          } finally {
            r.loading = false
          }
        })
      )
    }

    // 5. Garder seulement les accessibles
    resources.value = resources.value.filter(r => r.available)

    console.log(`✅ ${resources.value.length} ressources accessibles chargées`)

  } catch (err) {
    error.value = err.message || 'Erreur lors de la découverte'
    console.error('❌ loadResources :', err)
  } finally {
    loading.value = false
  }
}

 /**  🚀 RÉINITIALISER TOUT
   * Supprime TOUTES les ressources disponibles
   */
  async function purgeAll() {
    processing.value = true
    progress.value   = null
    lastReport.value = null
    error.value      = null

    const details = []
    let totalSuccess = 0
    let totalFailed  = 0

    try {
      for (const resource of resources.value) {

        let report

        // Cas spécial pour User
        if (resource.key === 'User') {
          report = await purgeUsersExceptSystem(
            (p) => { progress.value = { ...p, label: '👤 Utilisateurs (sauf système)' } }
          )
        } else {
          // Cas normal
          report = await GlpiClient.purgeResource(
            resource.key,
            (p) => { progress.value = { ...p, label: resource.label } }
          )
        }

        details.push({
          ...report,
          label: resource.label,
        })

        totalSuccess += report.success
        totalFailed  += report.failed
      }

      lastReport.value = { totalSuccess, totalFailed, details }
      await loadResources()

    } catch (err) {
      error.value = err.message || 'Erreur lors de la réinitialisation'
    } finally {
      processing.value = false
      progress.value   = null
    }
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
    purgeAll,
  }
})