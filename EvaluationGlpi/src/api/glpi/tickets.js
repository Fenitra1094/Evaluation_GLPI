import { glpiApi } from './core'
import { ensureSession } from './session'

export const STATUS_LABELS = {
    1: { label: 'Nouveau',    color: 'blue',   icon: '🔵' },
    2: { label: 'En cours',   color: 'orange', icon: '🟠' },
    3: { label: 'Planifié',   color: 'purple', icon: '🟣' },
    4: { label: 'En attente', color: 'yellow', icon: '🟡' },
    5: { label: 'Résolu',     color: 'green',  icon: '🟢' },
    6: { label: 'Clos',       color: 'gray',   icon: '⚫' },
}
export const TYPE_LABELS = {
  1: { label: 'Incident', color: 'red',  icon: '⚠️' },
  2: { label: 'Demande',  color: 'blue', icon: '📩' },
}

export const PRIORITY_LABELS = {
  1: { label: 'Très basse', color: 'gray'   },
  2: { label: 'Basse',      color: 'blue'   },
  3: { label: 'Moyenne',    color: 'yellow' },
  4: { label: 'Haute',      color: 'orange' },
  5: { label: 'Très haute', color: 'red'    },
  6: { label: 'Majeure',    color: 'purple' },
}

//Fonction API 

/** Pour avoir le liste de tickets  */
export async function getTickets({
    start = 0,
    limit = 100,
    sort = 'date_creation',
    order = 'DESC',
    search = '',
} = {}) {
    await ensureSession()
    const range = `${start}-${start + limit -1}`
    const params = {
        expand_dropdowns: true,
        range,
        sort,
        order,
    }

    if(search){
        params['serachText[name]'] = search
    }
    const response = await glpiApi.get('/Ticket', { params })
    return Array.isArray(response.data) ? response.data : []
}

/** Recupere un ticket par Id avec tous les details */
export async function getTicketById(id){
    await ensureSession()
    const reponse = await glpiApi.get(`/Ticket/${id}`, {
        params: {expand_dropdowns: true},
    })
    return response.data
}

/** Recupere  les items  */

export async function getTicketItems(ticketId){
    await ensureSession()

    try{
        const response = await glpi.get(`/Ticket/${ticketId}/Iem_Ticket`,{params: { expand_dropdowns: true },
        })
        return Array.isArray(response.data) ? response.data : []
    }
    catch(error){
        return []
    }
}

/** Recupere les couts d'un tickets */

export async function   getTicketCosts(tickeId){
    await ensureSession()
    try{
        const response = await glpiApi.get(`/Ticket/${ticketId}/TicketCost`)
        return Array.isArray(response.data) ? response.data : []
    }
    catch(error){
        return []
    }
}

    /**
     * Récupère les détails d'un item par son type+id
     */
    export async function getItemDetails(itemtype, itemId) {
    await ensureSession()

    try {
        const response = await glpiApi.get(`/${itemtype}/${itemId}`, {
        params: { expand_dropdowns: true },
        })
        return response.data
    } catch (error) {
            return null
        }
    }

