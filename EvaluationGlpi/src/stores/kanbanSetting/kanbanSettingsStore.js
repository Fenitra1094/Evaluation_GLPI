import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import LocalClient from '@/api/localClient'
import { useLanguagesStore } from './languagesStore'

export const useKanbanSettingsStore = defineStore('kanbanSettings', () => {

  // ============ STATE ============
  const settings = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)

  // ============ GETTERS ============
  const settingsByKey = computed(() => {
    const map = {}
    settings.value.forEach(s => { map[s.columnKey] = s })
    return map
  })

  const settingsByStatus = computed(() => {
    const map = {}
    settings.value.forEach(s => { map[s.status] = s })
    return map
  })

  // ============ ACTIONS ============
  async function loadSettings() {
    loading.value = true
    error.value = null
    try {
      settings.value = await LocalClient.getKanbanSettings()
      console.log('✅ Kanban settings chargés', settings.value)
    } catch (err) {
      error.value = err.message
      console.error('❌', err)
    } finally {
      loading.value = false
    }
  }

  async function saveAll(updatedSettings) {
    saving.value = true
    error.value = null
    try {
      for (const setting of updatedSettings) {
        await LocalClient.updateKanbanSetting(setting.id, setting)
      }
      await loadSettings()
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      saving.value = false
    }
  }

  async function resetSettings() {
    saving.value = true
    try {
      await LocalClient.resetKanbanSettings()
      await loadSettings()
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      saving.value = false
    }
  }

  // ============ HELPERS ============
  /**
   * Récupère le label d'une colonne dans la langue courante
   */
  function getLabel(setting, langCode = null) {
    if (!setting?.translations) return setting?.columnKey || '?'

    const languagesStore = useLanguagesStore()
    const code = langCode || languagesStore.currentLang

    // 1. Chercher la traduction demandée
    const trans = setting.translations.find(t => t.languageCode === code)
    if (trans) return trans.label

    // 2. Fallback : langue par défaut
    const defaultLang = languagesStore.defaultLanguage?.code
    if (defaultLang) {
      const fallback = setting.translations.find(t => t.languageCode === defaultLang)
      if (fallback) return fallback.label
    }

    // 3. Fallback ultime : 1ère traduction dispo
    return setting.translations[0]?.label || setting.columnKey
  }

  return {
    settings, loading, saving, error,
    settingsByKey, settingsByStatus,
    loadSettings, saveAll, resetSettings,
    getLabel,
  }
})