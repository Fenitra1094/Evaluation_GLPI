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
  async getAll() {
    const response = await localApi.get('/local/computers')
    return response.data
  },

  async getById(id) {
    const response = await localApi.get(`/local/computers/${id}`)
    return response.data
  },

  async create(data) {
    const response = await localApi.post('/local/computers', data)
    return response.data
  },

  async update(id, data) {
    const response = await localApi.put(`/local/computers/${id}`, data)
    return response.data
  },

  async delete(id) {
    await localApi.delete(`/local/computers/${id}`)
  },

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
  
  // ⭐ AJOUT : Supprimer TOUTES les langues
  async deleteAllLanguages() {
    const response = await localApi.delete('/local/languages')
    return response.data
  },
  // ======================
  // COUTS (SQLite)
  // ======================

  // Créer un coût SAISI (passage à Closed)
  async createTicketSolution(ticketId, montant) {
    const response = await localApi.post('/local/cout/creer', {
      ticket: Number(ticketId),
      cout: Number(montant)
    })
    return response.data
  },

  // Réouverture avec pourcentage (REOUVERTURE)
  async addPourcentage(ticketId, pourcentage) {
    const response = await localApi.post(`/local/cout/reouverture/${ticketId}`, {
      pourcentage: Number(pourcentage)
    })
    return response.data
  },

  // Récupérer tous les coûts
  async getAllCouts() {
    const response = await localApi.get('/local/cout')
    return response.data
  },

  // Supprimer le dernier coût d'un ticket
  async deleteCout(ticketId) {
    await localApi.delete(`/local/cout/ticket/${ticketId}/last`)
  },

  async deleteAllCouts() {
    const response = await localApi.delete('/local/cout')
    return response.data
  },
}

export default LocalClient