import axios from 'axios'

// -----------------------------------------------
// Instance Axios configurée pour GLPI
// -----------------------------------------------
const glpiApi = axios.create({
  baseURL: import.meta.env.VITE_GLPI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'App-Token': import.meta.env.VITE_GLPI_APP_TOKEN,
  },
})

// -----------------------------------------------
// Gestion du Session-Token automatique
// -----------------------------------------------
glpiApi.interceptors.request.use((config) => {
  const sessionToken = sessionStorage.getItem('glpi_session_token')
  if (sessionToken) {
    config.headers['Session-Token'] = sessionToken
  }
  return config
})

// -----------------------------------------------
// CLIENT GLPI
// -----------------------------------------------
const GlpiClient = {

  // ======================
  // SESSION
  // ======================

  /**
   * Initialise la session GLPI
   * Stocke le session_token dans sessionStorage
   */
  async initSession() {
    const login    = import.meta.env.VITE_GLPI_LOGIN
    const password = import.meta.env.VITE_GLPI_PASSWORD
    const credentials = btoa(`${login}:${password}`)

    const response = await glpiApi.get('/initSession', {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    })

    const token = response.data.session_token
    sessionStorage.setItem('glpi_session_token', token)
    return token
  },

  /**
   * Ferme la session GLPI
   */
  async killSession() {
    await glpiApi.get('/killSession')
    sessionStorage.removeItem('glpi_session_token')
  },

  /**
   * Vérifie si une session existe
   * Sinon en crée une nouvelle
   */
  async ensureSession() {
    const token = sessionStorage.getItem('glpi_session_token')
    if (!token) {
      await this.initSession()
    }
  },

  // ======================
  // COMPUTERS
  // ======================

  /**
   * Récupère la liste des ordinateurs
   * @param {Object} params - paramètres de pagination et filtres
   */
  async getComputers({
    start  = 0,
    limit  = 50,
    sort   = 'id',
    order  = 'ASC',
    search = '',
  } = {}) {
    await this.ensureSession()

    const range = `${start}-${start + limit - 1}`

    const params = {
      expand_dropdowns: true,
      range,
      sort,
      order,
    }

    // Filtre par nom si renseigné
    if (search) {
      params['searchText[name]'] = search
    }

    const response = await glpiApi.get('/Computer', { params })
    return response.data
  },

  /**
   * Récupère un ordinateur par son ID
   * @param {Number} id
   */
  async getComputerById(id) {
    await this.ensureSession()

    const response = await glpiApi.get(`/Computer/${id}`, {
      params: { expand_dropdowns: true },
    })
    return response.data
  },

    // ======================
  // GENERIC RESOURCES
  // ======================

  /**
   * Récupère TOUS les éléments d'une ressource (sans pagination)
   * @param {String} resource - Ex: 'Computer', 'Ticket', 'Monitor'
   */
  async getAllItems(resource) {
    await this.ensureSession()

    try {
      const response = await glpiApi.get(`/${resource}`, {
        params: {
          range: '0-9999',
          only_id: true,
        },
      })
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      // 401/404 = pas d'éléments
      if (error.response?.status === 401 || error.response?.status === 404) {
        return []
      }
      throw error
    }
  },

  /**
   * Compte le nombre d'éléments d'une ressource
   */
  async countItems(resource) {
    const items = await this.getAllItems(resource)
    return items.length
  },

  /**
   * Supprime un élément (purge définitive)
   */
  async deleteItem(resource, id) {
    await this.ensureSession()

    return glpiApi.delete(`/${resource}/${id}`, {
      params: { force_purge: true },
    })
  },

  /**
   * Supprime TOUS les éléments d'une ressource
   * Retourne un rapport {success, failed, total}
   */
  async purgeResource(resource, onProgress = null) {
    const items = await this.getAllItems(resource)
    const total = items.length

    let success = 0
    let failed  = 0

    for (let i = 0; i < items.length; i++) {
      try {
        await this.deleteItem(resource, items[i].id)
        success++
      } catch (err) {
        failed++
        console.error(`Erreur suppression ${resource}#${items[i].id}`, err)
      }

      if (onProgress) {
        onProgress({ resource, current: i + 1, total, success, failed })
      }
    }

    return { resource, total, success, failed }
  },
  
  async discoverResources() {
    const baseUrl = import.meta.env.VITE_GLPI_BASE_URL.replace(/\/v\d+$/, '')
    const docUrl  = `${baseUrl}/doc.json`

    console.log('🔍 Découverte des ressources via :', docUrl)

    const response = await axios.get(docUrl)
    const schema   = response.data

    const map = new Map()

    for (const path in schema.paths) {
      // Match les paths de type : /Category/Resource
      // Ex: /Assets/Computer, /Assistance/Ticket
      const matches = path.match(/^\/([A-Z][a-zA-Z0-9]+)\/([A-Z][a-zA-Z0-9]+)$/)
      if (matches) {
        const category = matches[1]
        const resource = matches[2]

        if (!map.has(resource)) {
          map.set(resource, { key: resource, category })
        }
      }
    }

    const list = Array.from(map.values()).sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }
      return a.key.localeCompare(b.key)
    })

    console.log('✅ Ressources découvertes :', list.length)
    return list
  },

}

export default GlpiClient