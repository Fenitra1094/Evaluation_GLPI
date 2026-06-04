import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import LocalClient from '@/api/localClient'
import GlpiClient from '@/api/glpiClient'

export const useLocalComputerStore = defineStore('localComputers', () => {

  // ---- STATE ----
  const items       = ref([])
  const loading     = ref(false)
  const saving      = ref(false)
  const error       = ref(null)
  const searchQuery = ref('')

  // ---- GETTERS ----
  const filtered = computed(() => {
    if (!searchQuery.value) return items.value
    const q = searchQuery.value.toLowerCase()
    return items.value.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.serial?.toLowerCase().includes(q) ||
      c.customTag?.toLowerCase().includes(q)
    )
  })

  const totalCount = computed(() => items.value.length)

  // ---- ACTIONS ----

  /** Charge tous les ordinateurs locaux */
  async function fetchAll() {
    loading.value = true
    error.value   = null
    try {
      items.value = await LocalClient.getAll()
    } catch (err) {
      error.value = extractError(err)
    } finally {
      loading.value = false
    }
  }

  /** Crée un nouvel ordinateur */
  async function create(data) {
    saving.value = true
    error.value  = null
    try {
      const created = await LocalClient.create(data)
      items.value.push(created)
      return created
    } catch (err) {
      error.value = extractError(err)
      throw err
    } finally {
      saving.value = false
    }
  }

  /** Modifie un ordinateur */
  async function update(id, data) {
    saving.value = true
    error.value  = null
    try {
      const updated = await LocalClient.update(id, data)
      const i = items.value.findIndex(c => c.id === id)
      if (i !== -1) items.value[i] = updated
      return updated
    } catch (err) {
      error.value = extractError(err)
      throw err
    } finally {
      saving.value = false
    }
  }

  /** Supprime un ordinateur */
  async function remove(id) {
    error.value = null
    try {
      await LocalClient.delete(id)
      items.value = items.value.filter(c => c.id !== id)
    } catch (err) {
      error.value = extractError(err)
      throw err
    }
  }

  /** Importe un ordinateur depuis GLPI */
  async function importFromGlpi(glpiId) {
    saving.value = true
    error.value  = null
    try {
      // 1. Récupérer l'ordinateur GLPI
      const glpiComputer = await GlpiClient.getComputerById(glpiId)

      // 2. Le mapper en LocalComputer
      const data = {
        glpiComputerId:    glpiComputer.id,
        name:              glpiComputer.name || 'Sans nom',
        serial:            glpiComputer.serial || '',
        localNote:         glpiComputer.comment || '',
        customTag:         'importé-glpi',
        priority:          3,
        importedFromGlpi:  true,
      }

      // 3. L'enregistrer dans SQLite
      const created = await LocalClient.create(data)
      items.value.push(created)
      return created
    } catch (err) {
      error.value = extractError(err)
      throw err
    } finally {
      saving.value = false
    }
  }

  /** Liste les ordinateurs GLPI (pour le sélecteur d'import) */
  async function getGlpiComputers() {
    return await GlpiClient.getComputers({ start: 0, limit: 200 })
  }

  // ---- HELPERS ----
  function extractError(err) {
    if (err.response?.data?.errors) {
      // Erreur de validation Spring
      return Object.values(err.response.data.errors).join(', ')
    }
    return err.response?.data?.error
      || err.response?.data?.message
      || err.message
      || 'Erreur inconnue'
  }

  return {
    // state
    items,
    loading,
    saving,
    error,
    searchQuery,
    // getters
    filtered,
    totalCount,
    // actions
    fetchAll,
    create,
    update,
    remove,
    importFromGlpi,
    getGlpiComputers,
  }
})