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
async createTicketSolution(ticketId, montant, items, type) {
  if (!items || items.length === 0) {
    throw new Error('Aucun item à traiter')
  }

  const total = Number(montant)
  const nbItems = items.length
  const coutParItem = Number((total / nbItems).toFixed(3))

  const timestamp = new Date().toISOString().replace(/Z$/, '')

  // ⭐ LOG DE DEBUG
  console.log('🔍 timestamp généré:', timestamp)
  console.log('🔍 type:', typeof timestamp, 'longueur:', timestamp.length)

  try {
    const promises = items.map(item => {
      const payload = {
        ticket    : Number(ticketId),
        cout      : coutParItem,
        type      : type,
        item      : String(item.items_id),
        category  : item.itemtype,
        createdAt : timestamp,
      }
      console.log('🔍 PAYLOAD ENVOYÉ:', JSON.stringify(payload))
      return localApi.post('/local/cout/creer', payload)
    })

    const responses = await Promise.all(promises)
    return responses.map(r => r.data)
  } catch (err) {
    console.error('❌ Erreur', err.response?.data)
    throw err
  }
},

  // recuperer le dernier cout
  async getDernierCout(ticketId) {
    const response = await localApi.get(`/local/cout/dernierCout/${ticketId}`)
    return response.data
  },
  async getDebutCout(ticketId) {
    const response = await localApi.get(`/local/cout/debutCout/${ticketId}`)
    return response.data
  },
  async getMoyenCout(ticketId){
    const response = await localApi.get(`/local/cout/moyenCout/${ticketId}`)
    return response.data
  },
  async getSommeCout(ticketId){
    const response = await localApi.get(`/local/cout/sommeCout/${ticketId}`)
    return response.data
  },

  // Réouverture avec pourcentage (REOUVERTURE)
  async addPourcentage(ticketId, pourcentage) {
    const response = await localApi.post(`/local/cout/reouverture/${ticketId}`, {
      pourcentage: Number(pourcentage)
    })
    return response.data
  },
  /**
 * ⭐ Annule (supprime) le dernier SAISI d'un ticket
 *    Supprime toutes les lignes du même timestamp en bloc
 */
async annulerDernierSaisi(ticketId) {
  try {
    const response = await localApi.delete(`/local/cout/annulerDernier/${ticketId}`)
    console.log(
      `🗑️ Annulation OK : ${response.data.nbSupprimes} ligne(s) supprimée(s), ` +
      `total ${response.data.totalSupprime}€`
    )
    return response.data
  } catch (err) {
    console.error('❌ Erreur annulation', err.response?.data || err.message)
    throw err
  }
},

  // Récupérer tous les coûts
  async getAllCouts() {
    const response = await localApi.get('/local/cout')
    return response.data
  },

  // Supprimer le dernier coût d'un ticket
  async AnnulerCout(ticketId) {
   const response = await localApi.get(`/local/cout/annuler/${ticketId}`)
   return response.data
  },

  async deleteAllCouts() {
    const response = await localApi.delete('/local/cout')
    return response.data
  },

 
  
  async  createItem(data) {
    
  
    try {

      console.log(`📦  Création avec :`, data)
      const response = await localApi.post(`/local/cout/creer`, data)
  
      const created = Array.isArray(response.data) ? response.data[0] : response.data
     // console.log(`📦 [${resource}] ✅ Créé (id=${created.id})`)
      return created.id
  
    } catch (error) {
      // const err = extractGlpiError(error)
      // console.error(`📦 [${resource}] ❌ Erreur création :`, err)
      // console.error(`📦 [${resource}] Données envoyées :`, data)
  
      // // Re-throw avec message clair
      // throw new Error(
      //   `${resource} : ${err.code} - ${err.message}`
      // )
    }
  }
  
}

export default LocalClient