import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'
import LocalApi from '@/api/localClient'

export const KANBAN_COLUMNS = [
  { id: 'new',      label: 'Nouveau',     icon: '🔵', color: 'blue',   status: 1 },
  { id: 'progress', label: 'In progress', icon: '🟠', color: 'orange', status: 2 },
  { id: 'done',     label: 'Closed',      icon: '🟢', color: 'green',  status: 6 },
]

const KANBAN_STATUSES = KANBAN_COLUMNS.map(c => c.status)

export const useKanbanStore = defineStore('kanban', () => {

  // ============================================================
  // STATE
  // ============================================================
  const allTickets     = ref([])
  const loading        = ref(false)
  const error          = ref(null)
  const availableUsers = ref([])

  // ============================================================
  // GETTERS
  // ============================================================
  const ticketsByColumn = computed(() => {
    const result = {}
    const cols = [
      { columnKey: 'new',      status: 1 },
      { columnKey: 'progress', status: 2 },
      { columnKey: 'done',     status: 6 },
    ]
    cols.forEach(col => {
      result[col.columnKey] = allTickets.value.filter(t => t.status === col.status)
    })
    return result
  })

  const totalByColumn = computed(() => {
    const result = {}
    Object.keys(ticketsByColumn.value).forEach(key => {
      result[key] = ticketsByColumn.value[key].length
    })
    return result
  })

  // ============================================================
  // ACTIONS : CHARGEMENT
  // ============================================================
  async function loadTickets() {
    loading.value = true
    error.value   = null

    try {
      const tickets = await GlpiClient.getTickets({
        start: 0, limit: 500,
        sort: 'date_creation', order: 'DESC',
      })
      allTickets.value = tickets.filter(t => KANBAN_STATUSES.includes(t.status))
      console.log(`✅ Kanban : ${allTickets.value.length} tickets`)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function loadUsers() {
    try {
      availableUsers.value = await GlpiClient.getAllItemsWithDetails('User')
    } catch (e) {
      availableUsers.value = []
    }
  }

  // ============================================================
  // ⭐ FONCTIONS MÉTIER (LA "SOURCE DE VÉRITÉ")
  // Ces fonctions sont appelées depuis :
  //   1. Le Kanban (drag & drop via changeStatus)
  //   2. L'import CSV (via processRow dans importMvtStore)
  // ============================================================

  /**
   * Crée un coût SAISI
   * @param {number} ticketId - ID du ticket GLPI
   * @param {number} montant  - Montant à enregistrer
   */
  async function createSaisi(ticketId, montant) {
    // if (!montant ) {
    //   throw new Error('Montant invalide')
    // }

    const items = await GlpiClient.getTicketItems(ticketId)

    if (!items || items.length === 0) {
      throw new Error(`Aucun item lié au ticket #${ticketId}`)
    }

    console.log(`💰 SAISI : ${montant}€ pour ticket #${ticketId}`)

    return await LocalApi.createTicketSolution(
      ticketId,
      Number(montant),
      items,
      'SAISI'
    )
  }

 /**
 * Annule le dernier SAISI en le SUPPRIMANT (au lieu de créer un coût négatif)
 * @param {number} ticketId - ID du ticket GLPI
 */
async function createCancel(ticketId) {
  console.log(`🗑️ CANCEL : suppression du dernier SAISI pour ticket #${ticketId}`)

  try {
    const result = await LocalApi.annulerDernierSaisi(ticketId)

    console.log(
      `✅ CANCEL OK : ${result.nbSupprimes} ligne(s) supprimée(s), ` +
      `total = ${result.totalSupprime}€`
    )

    return result
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(`Pas de coût SAISI à annuler pour ticket #${ticketId}`)
    }
    throw err
  }
}
  /**
   * Crée un coût REOUVERTURE (pourcentage du dernier SAISI)
   * @param {number} ticketId    - ID du ticket GLPI
   * @param {number} pourcentage - Pourcentage à appliquer (ex: 50 = 50%)
   */
  async function createReouverture(ticketId, pourcentage, mode) {
    if (!pourcentage || pourcentage <= 0) {
      throw new Error('Pourcentage invalide')
    } 
    console.log(`🔄 MOde : ${mode}`)
    const CoutValeur = ref(0)
    const items = await GlpiClient.getTicketItems(ticketId)

    if (!items || items.length === 0) {
      throw new Error(`Aucun item lié au ticket #${ticketId}`)
    }
    if(mode == 1){
        const dernierCout = await LocalApi.getDernierCout(ticketId)
       CoutValeur.value = dernierCout?.cout || 0
    }
    if(mode == 2){
      const dernierCout = await LocalApi.getDebutCout(ticketId)
      CoutValeur.value = dernierCout?.cout || 0
    }
    if(mode == 3){
       CoutValeur.value = await LocalApi.getMoyenCout(ticketId)
    }
    if(mode == 4){
       CoutValeur.value = await LocalApi.getSommeCout(ticketId)
    }
    

    // if (dernierCoutValeur === 0) {
    //   throw new Error(`Pas de coût SAISI précédent pour ticket #${ticketId}`)
    // }

    const nouveauCout = Number(((pourcentage / 100) * CoutValeur.value).toFixed(3))

    console.log(`🔄 REOUVERTURE : ${pourcentage}% × ${CoutValeur.value}€ = ${nouveauCout}€`)

    return await LocalApi.createTicketSolution(
      ticketId,
      nouveauCout,
      items,
      'REOUVERTURE'
    )
  }

  // ============================================================
  // ACTIONS : APPEL DEPUIS LE KANBAN (drag & drop)
  // ⭐ Utilise les fonctions métier ci-dessus
  // ============================================================

  /**
   * Change le statut d'un ticket + actions associées
   * Appelée par le drag & drop dans KanbanView
   */
  async function changeStatus(ticketId, newStatus, extra = {}) {
    try {
      // 1. Changer le statut du ticket dans GLPI
      await GlpiClient.updateTicketStatus(ticketId, newStatus)

      // 2. Assigner un acteur si fourni
      if (extra.userId) {
        try {
          await GlpiClient.addTicketActor(ticketId, extra.userId, 2)
        } catch (e) {
          console.warn('⚠️ Erreur acteur', e.message)
        }
      }

      // 3. ⭐ Créer un coût SAISI (utilise la fonction métier)
      if (extra.cout && extra.cout > 0) {
        try {
          await createSaisi(ticketId, extra.cout)
        } catch (e) {
          console.warn('⚠️ Erreur SAISI', e.message)
        }
      }

      // 4. ⭐ Créer un coût REOUVERTURE (utilise la fonction métier)
      if (extra.pourcentage && extra.pourcentage > 0) {
        try {
          await createReouverture(ticketId, extra.pourcentage, extra.mode)
        } catch (e) {
          console.warn('⚠️ Erreur REOUVERTURE', e.message)
        }
      }

      // 5. Ajouter un commentaire si fourni
      if (extra.comment) {
        try {
          await GlpiClient.addTicketFollowup(ticketId, extra.comment)
        } catch (e) {
          console.warn('⚠️ Erreur commentaire', e.message)
        }
      }

      // 6. Mettre à jour le ticket localement
      const ticket = allTickets.value.find(t => t.id === ticketId)
      if (ticket) ticket.status = newStatus

      return true
    } catch (err) {
      error.value = err.message
      return false
    }
  }

  /**
   * Annulation depuis le bouton "Annulation" du modal Kanban
   * ⭐ Utilise la fonction métier createCancel
   */
  async function annulation(ticketId) {
    try {
      await createCancel(ticketId)
    } catch (e) {
      console.warn('⚠️ Erreur annulation', e.message)
    }
  }

  // ============================================================
  // CRÉATION DE TICKET SIMPLE
  // ============================================================
  async function createSimpleTicket({ name, content, status = 1 }) {
    try {
      const ticketId = await GlpiClient.createTicket({ name, content, status })
      await loadTickets()
      return ticketId
    } catch (err) {
      error.value = err.message
      return null
    }
  }

  // ============================================================
  // EXPORTS
  // ============================================================
  return {
    // state
    allTickets,
    loading,
    error,
    availableUsers,

    // getters
    ticketsByColumn,
    totalByColumn,

    // actions de chargement
    loadTickets,
    loadUsers,

    // actions Kanban (UI)
    changeStatus,
    annulation,
    createSimpleTicket,

    // ⭐ fonctions métier (réutilisables depuis Import CSV)
    createSaisi,
    createCancel,
    createReouverture,
  }
})