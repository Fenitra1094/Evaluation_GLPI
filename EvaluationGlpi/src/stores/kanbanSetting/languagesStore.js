import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import LocalClient from '@/api/localClient'

export const useLanguagesStore = defineStore('languages', () => {

  // ============ STATE ============
  const languages = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)
  const currentLang = ref(localStorage.getItem('app_lang') || 'fr')

  // ============ GETTERS ============
  const activeLanguages = computed(() => {
    return languages.value.filter(l => l.isActive)
  })

  const defaultLanguage = computed(() => {
    return languages.value.find(l => l.isDefault) || languages.value[0]
  })

  // ============ ACTIONS ============
  async function loadLanguages() {
    loading.value = true
    error.value = null
    try {
      languages.value = await LocalClient.getLanguages()
    } catch (err) {
      error.value = err.message
      console.error('❌ Erreur chargement langues', err)
    } finally {
      loading.value = false
    }
  }

  async function createLanguage(data) {
    saving.value = true
    error.value = null
    try {
      const created = await LocalClient.createLanguage(data)
      languages.value.push(created)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return false
    } finally {
      saving.value = false
    }
  }

  async function updateLanguage(code, data) {
    saving.value = true
    error.value = null
    try {
      const updated = await LocalClient.updateLanguage(code, data)
      const index = languages.value.findIndex(l => l.code === code)
      if (index !== -1) languages.value[index] = updated
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      saving.value = false
    }
  }

  async function deleteLanguage(code) {
    saving.value = true
    try {
      await LocalClient.deleteLanguage(code)
      languages.value = languages.value.filter(l => l.code !== code)
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      saving.value = false
    }
  }

  function setCurrentLang(code) {
    currentLang.value = code
    localStorage.setItem('app_lang', code)
  }

  return {
    languages, loading, saving, error, currentLang,
    activeLanguages, defaultLanguage,
    loadLanguages, createLanguage, updateLanguage, deleteLanguage,
    setCurrentLang,
  }
})