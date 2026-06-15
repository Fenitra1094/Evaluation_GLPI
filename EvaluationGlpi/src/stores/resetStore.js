
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'
import LocalClient from '@/api/localClient'   // ⭐ AJOUT

// =========================================================
// WHITELIST DE PROTECTION
// =========================================================
const PROTECTED_RESOURCES = new Set([
  'Profile', 'ProfileRight', 'Profile_User',
  'Group_User', 'UserEmail',
  'Entity', 'Config', 'DisplayPreference',
  'APIClient', 'Session', 'Log',
  'AuthLDAP', 'AuthMail', 'CronTask',
  'Notification', 'NotificationTemplate', 'NotificationTarget',
  'RequestType', 'TaskCategory', 'SolutionType',
  'DocumentCategory', 'DocumentType', 'ITILCategory',
  'Calendar', 'CalendarSegment', 'Holiday',
  'Dashboard', 'DomainRelation',
])

const PROTECTED_USERS = new Set([
  'glpi',
  'glpi-system',
])

// =========================================================
// FONCTION : Nettoyer les utilisateurs (sauf système)
// =========================================================
async function purgeUsersExceptSystem(onProgress = null) {
  console.log('👤 Chargement de tous les users...')
  await GlpiClient.ensureSession()

  const allUsers = await GlpiClient.getAllItemsWithDetails('User')
  const usersToDelete = allUsers.filter(u => !PROTECTED_USERS.has(u.name))

  console.log(`👤 ${usersToDelete.length} users à supprimer sur ${allUsers.length}`)

  if (usersToDelete.length === 0) {
    return { resource: 'User', total: 0, success: 0, failed: 0 }
  }

  let success = 0
  let failed = 0
  const BATCH_SIZE = 10

  for (let i = 0; i < usersToDelete.length; i += BATCH_SIZE) {
    const batch = usersToDelete.slice(i, i + BATCH_SIZE)

    const results = await Promise.allSettled(
      batch.map(u => GlpiClient.deleteItem('User', u.id))
    )

    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        success++
      } else {
        failed++
      }
    })

    if (onProgress) {
      onProgress({
        resource: 'User',
        current: Math.min(i + BATCH_SIZE, usersToDelete.length),
        total: usersToDelete.length,
        success, failed,
      })
    }
  }

  return { resource: 'User', total: usersToDelete.length, success, failed }
}

// =========================================================
// ⭐ NOUVELLE FONCTION : Nettoyer SQLite local
// =========================================================
async function purgeSQLiteLocal(onProgress = null) {
  console.log('🗑️ Nettoyage de la base SQLite locale...')

  const report = {
    couts: 0,
    languages: 0,
    kanbanSettings: 0,
    errors: [],
  }

  // 1. Supprimer tous les coûts
  try {
    onProgress?.({ label: '💰 SQLite : Coûts', current: 0, total: 3 })
    const result = await LocalClient.deleteAllCouts()
    console.log('✅', result)
    report.couts = 1
  } catch (e) {
    console.warn('⚠️ Erreur suppression coûts :', e.message)
    report.errors.push('coûts: ' + e.message)
  }

  // 2. Réinitialiser les kanban settings (supprime + recrée par défaut)
  try {
    onProgress?.({ label: '🎨 SQLite : Kanban Settings', current: 1, total: 3 })
    await LocalClient.resetKanbanSettings()
    console.log('✅ Kanban settings réinitialisés')
    report.kanbanSettings = 1
  } catch (e) {
    console.warn('⚠️ Erreur reset kanban :', e.message)
    report.errors.push('kanban: ' + e.message)
  }

  // 3. ⚠️ ATTENTION : Ne pas supprimer les langues
  // Les langues sont liées aux kanban_translations (FK)
  // Le resetKanbanSettings recrée déjà les traductions
  // → On garde les langues telles quelles
  console.log('ℹ️ Langues conservées (utilisées par les traductions)')

  onProgress?.({ label: '✅ SQLite : Terminé', current: 3, total: 3 })

  return report
}

// =========================================================
// STORE
// =========================================================
export const useResetStore = defineStore('reset', () => {

  // ---- STATE ----
  const resources = ref([])
  const loading = ref(false)
  const processing = ref(false)
  const progress = ref(null)
  const lastReport = ref(null)
  const error = ref(null)

  // ⭐ AJOUT : option pour activer/désactiver le nettoyage SQLite
  const cleanSQLite = ref(true)

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

  async function loadResources() {
    loading.value = true
    error.value = null

    try {
      const discovered = await GlpiClient.discoverResources()
      const usable = discovered.filter(r => !PROTECTED_RESOURCES.has(r.key))

      resources.value = usable.map(r => ({
        key: r.key,
        label: r.key,
        category: r.category,
        count: 0,
        loading: true,
        selected: false,
        available: true,
      }))

      const BATCH_SIZE = 5
      for (let i = 0; i < resources.value.length; i += BATCH_SIZE) {
        const batch = resources.value.slice(i, i + BATCH_SIZE)

        await Promise.all(
          batch.map(async (r) => {
            try {
              r.count = await GlpiClient.countItems(r.key)
              r.available = true
            } catch (e) {
              r.count = 0
              r.available = false
            } finally {
              r.loading = false
            }
          })
        )
      }

      resources.value = resources.value.filter(r => r.available)
      console.log(`✅ ${resources.value.length} ressources accessibles chargées`)

    } catch (err) {
      error.value = err.message || 'Erreur lors de la découverte'
    } finally {
      loading.value = false
    }
  }

  /**
   * 🚀 RÉINITIALISER TOUT
   * Supprime TOUTES les ressources GLPI + nettoyage SQLite
   */
  async function purgeAll() {
    processing.value = true
    progress.value = null
    lastReport.value = null
    error.value = null

    const details = []
    let totalSuccess = 0
    let totalFailed = 0
    let sqliteReport = null

    try {
      // ═══════════════════════════════════════════
      // PHASE 1 : Nettoyage SQLite EN PREMIER
      // ═══════════════════════════════════════════
      // ⭐ On nettoie SQLite AVANT GLPI pour éviter
      // les orphelins (coûts liés à des tickets supprimés)
      if (cleanSQLite.value) {
        console.log('🗑️ === PHASE 1 : Nettoyage SQLite ===')

        sqliteReport = await purgeSQLiteLocal(
          (p) => { progress.value = p }
        )

        console.log('✅ SQLite nettoyé :', sqliteReport)
      }

      // ═══════════════════════════════════════════
      // PHASE 2 : Suppression GLPI
      // ═══════════════════════════════════════════
      console.log('🗑️ === PHASE 2 : Suppression GLPI ===')

      for (const resource of resources.value) {
        let report

        if (resource.key === 'User') {
          report = await purgeUsersExceptSystem(
            (p) => { progress.value = { ...p, label: '👤 Utilisateurs (sauf système)' } }
          )
        } else {
          report = await GlpiClient.purgeResource(
            resource.key,
            (p) => { progress.value = { ...p, label: resource.label } }
          )
        }

        details.push({ ...report, label: resource.label })
        totalSuccess += report.success
        totalFailed += report.failed
      }

      // ═══════════════════════════════════════════
      // RAPPORT FINAL
      // ═══════════════════════════════════════════
      lastReport.value = {
        totalSuccess,
        totalFailed,
        details,
        sqlite: sqliteReport,  // ⭐ Rapport SQLite
      }

      await loadResources()

    } catch (err) {
      error.value = err.message || 'Erreur lors de la réinitialisation'
    } finally {
      processing.value = false
      progress.value = null
    }
  }

  return {
    // state
    resources, loading, processing, progress,
    lastReport, error, cleanSQLite,
    // getters
    selectedResources, hasSelection, totalElements, groupedByCategory,
    // actions
    loadResources, purgeAll,
  }
})
