import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'
import LocalApi from '@/api/localClient'

export const KANBAN_COLUMNS = [
  { id: 'new',      label: 'Nouveau',     icon: '🔵', color: 'blue',   status: 1 },
  { id: 'progress', label: 'In progress', icon: '🟠', color: 'orange', status: 2 },
  { id: 'done',     label: 'Closed',     icon: '🟢', color: 'green',  status: 6 },
]

const KANBAN_STATUSES = KANBAN_COLUMNS.map(c => c.status)

export const useKanbanStore = defineStore('kanban', () => {
  // ============ STATE ============
  const allTickets     = ref([])
  const loading        = ref(false)
  const error          = ref(null)
  const availableUsers = ref([])



  // ============ GETTERS ============
  const ticketsByColumn = computed(() => {
  const result = {}
  // Note : on doit attendre les settings, donc fallback sur les statuts hardcodés
  const cols = [
    { columnKey: 'new', status: 1 },
    { columnKey: 'progress', status: 2 },
    { columnKey: 'done', status: 6 },
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

  // ============ ACTIONS ============
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
  async function annulation(ticketId){
  try { 
    // 1. Récupérer les items
    const items = await GlpiClient.getTicketItems(ticketId)
    
    if (!items || items.length === 0) {
      console.warn('⚠️ Aucun item lié au ticket')
      return
    }
    
    // 2. Récupérer le dernier coût SAISI
    const dernierCout = await LocalApi.getDernierCout(ticketId) 
    const dernierCoutValeur = dernierCout?.cout || 0
    
    if (dernierCoutValeur === 0) {
      console.warn('⚠️ Pas de coût SAISI à annuler')
      return
    }
    
    // 3. Créer un coût négatif (annulation)
    const coutAnnulation = -dernierCoutValeur
    
    console.log(`🔄 Cancel : ${coutAnnulation}€ pour ticket #${ticketId}`)
    
    await LocalApi.createTicketSolution(
      ticketId, 
      coutAnnulation,   // négatif
      items,            // direct
      'CANCEL'          // direct
    )  
  } catch (e) { 
    console.warn('⚠️ Erreur annulation', e.message) 
  }
}

async function changeStatus(ticketId, newStatus, extra = {}) {
  try {
    await GlpiClient.updateTicketStatus(ticketId, newStatus)

    if (extra.userId) {
      try { await GlpiClient.addTicketActor(ticketId, extra.userId, 2) }
      catch (e) { console.warn('⚠️ Erreur acteur', e.message) }
    }

    // ⭐ CAS SAISI (passage à Closed)
    if (extra.cout && extra.cout > 0) {
      try { 
        console.log(`💰 Création SAISI : ${extra.cout}€ pour ticket #${ticketId}`)
        
        // ⭐ Récupérer les items
        const items = await GlpiClient.getTicketItems(ticketId)
        
        if (!items || items.length === 0) {
          console.warn('⚠️ Aucun item lié au ticket')
          return false
        }
        
        // ⭐ Passer les VALEURS directes
        await LocalApi.createTicketSolution(
          ticketId,         // number
          extra.cout,       // number direct
          items,            // tableau direct (pas un ref)
          'SAISI'           // string directe
        ) 
      }
      catch (e) { console.warn('⚠️ Erreur solution', e.message) }
    }

    // ⭐ CAS REOUVERTURE (passage à In progress depuis Closed)
    if (extra.pourcentage && extra.pourcentage > 0) {
      try { 
        const items = await GlpiClient.getTicketItems(ticketId)
        
        if (!items || items.length === 0) {
          console.warn('⚠️ Aucun item lié au ticket')
          return false
        }
        
        // ⭐ Récupérer le dernier coût SAISI
        const dernierCout = await LocalApi.getDernierCout(ticketId)
        const dernierCoutValeur = dernierCout?.cout || 0

       
        
        if (dernierCoutValeur === 0) {
          console.warn('⚠️ Pas de coût SAISI précédent')
          return false
        }
        
        // ⭐ Calculer le nouveau coût
        const nouveauCout = Number(((extra.pourcentage / 100) * dernierCoutValeur).toFixed(3))
        
        console.log(`🔄 Réouverture : ${extra.pourcentage}% × ${dernierCoutValeur}€ = ${nouveauCout}€`)
        
        await LocalApi.createTicketSolution(
          ticketId,
          nouveauCout,      // valeur calculée
          items,            // tableau direct
          'REOUVERTURE'     // string directe
          
        )  
      }
      catch (e) { console.warn('⚠️ Erreur pourcentage', e.message) }
    }

    if (extra.comment) {
      try { await GlpiClient.addTicketFollowup(ticketId, extra.comment) }
      catch (e) { console.warn('⚠️ Erreur commentaire', e.message) }
    }

    const ticket = allTickets.value.find(t => t.id === ticketId)
    if (ticket) ticket.status = newStatus

    return true
  } catch (err) {
    error.value = err.message
    return false
  }
}

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

  // =========================================================
// LOGIQUE SAISI (réutilisable depuis l'import CSV)
// =========================================================
async function createSaisi(ticketId, montant) {
  if (!montant || montant <= 0) {
    throw new Error('Montant invalide')
  }

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

// =========================================================
// LOGIQUE CANCEL (réutilisable)
// =========================================================
async function createCancel(ticketId) {
  const items = await GlpiClient.getTicketItems(ticketId)

  if (!items || items.length === 0) {
    throw new Error(`Aucun item lié au ticket #${ticketId}`)
  }

  const dernierCout = await LocalApi.getDernierCout(ticketId)
  const dernierCoutValeur = dernierCout?.cout || 0

  if (dernierCoutValeur === 0) {
    throw new Error(`Pas de coût SAISI à annuler pour ticket #${ticketId}`)
  }

  const coutAnnulation = -dernierCoutValeur

  console.log(`🔄 CANCEL : ${coutAnnulation}€ pour ticket #${ticketId}`)

  return await LocalApi.createTicketSolution(
    ticketId,
    coutAnnulation,
    items,
    'CANCEL'
  )
}

// =========================================================
// LOGIQUE REOUVERTURE (réutilisable)
// =========================================================
async function createReouverture(ticketId, pourcentage) {
  if (!pourcentage || pourcentage <= 0) {
    throw new Error('Pourcentage invalide')
  }

  const items = await GlpiClient.getTicketItems(ticketId)

  if (!items || items.length === 0) {
    throw new Error(`Aucun item lié au ticket #${ticketId}`)
  }

  const dernierCout = await LocalApi.getDernierCout(ticketId)
  const dernierCoutValeur = dernierCout?.cout || 0

  if (dernierCoutValeur === 0) {
    throw new Error(`Pas de coût SAISI précédent pour ticket #${ticketId}`)
  }

  const nouveauCout = Number(((pourcentage / 100) * dernierCoutValeur).toFixed(3))

  console.log(`🔄 REOUVERTURE : ${pourcentage}% × ${dernierCoutValeur}€ = ${nouveauCout}€`)

  return await LocalApi.createTicketSolution(
    ticketId,
    nouveauCout,
    items,
    'REOUVERTURE'
  )
}

  return {
    allTickets, loading, error, availableUsers,
    ticketsByColumn, totalByColumn,
    loadTickets, loadUsers,
    changeStatus, createSimpleTicket,annulation,
    createSaisi,
  createCancel,
  createReouverture,
  }
})