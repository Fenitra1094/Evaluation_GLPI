import axios from 'axios'

// Instance Axios pour notre backend Spring Boot
const localApi = axios.create({
  baseURL: import.meta.env.VITE_LOCAL_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// =========================================================
//  CLIENT LOCAL (Spring Boot + SQLite)
// =========================================================
const LocalClient = {

  // ======================
  // LOCAL COMPUTERS
  // ======================

  /** Liste tous les ordinateurs locaux */
  async getAll() {
    const response = await localApi.get('/local/computers')
    return response.data
  },

  /** Récupère un ordinateur par id */
  async getById(id) {
    const response = await localApi.get(`/local/computers/${id}`)
    return response.data
  },

  /** Crée un nouvel ordinateur local */
  async create(data) {
    const response = await localApi.post('/local/computers', data)
    return response.data
  },

  /** Modifie un ordinateur local */
  async update(id, data) {
    const response = await localApi.put(`/local/computers/${id}`, data)
    return response.data
  },

  /** Supprime un ordinateur local */
  async delete(id) {
    await localApi.delete(`/local/computers/${id}`)
  },

  /** Supprime tous les ordinateurs locaux */
  async deleteAll() {
    await localApi.delete('/local/computers')
  },


    // ======================
  // KANBAN SETTINGS
  // ======================
  async getKanbanSettings() {
    const response = await localApi.get('/local/kanban-settings')
    return response.data
  },

  async updateKanbanSetting(id, data) {
    const response = await localApi.put(`/local/kanban-settings/${id}`, data)
    return response.data
  },

  async resetKanbanSettings() {
    const response = await localApi.post('/local/kanban-settings/reset')
    return response.data
  },

  // ======================
  // LANGUAGES (CRUD)
  // ======================
  async getLanguages() {
    const response = await localApi.get('/local/languages')
    return response.data
  },

  async getActiveLanguages() {
    const response = await localApi.get('/local/languages/active')
    return response.data
  },

  async createLanguage(data) {
    const response = await localApi.post('/local/languages', data)
    return response.data
  },

  async updateLanguage(code, data) {
    const response = await localApi.put(`/local/languages/${code}`, data)
    return response.data
  },

  async deleteLanguage(code) {
    await localApi.delete(`/local/languages/${code}`)
  },

  
}

export default LocalClient