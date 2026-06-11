import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'

export const useTicketCreateStore = defineStore('ticketCreate', () => {

  // ============ STATE ============
  const form = ref({
    name: '',
    content: '',
    type: 1,
    status: 1,
    urgency: 3,
    impact: 3,
    priority: 3,
    date: new Date().toISOString().slice(0, 16),
  })

  const selectedItems = ref([])
  const costs = ref([])

  // ✅ NOUVEAU : Acteurs
  const actors = ref({
    requesters: [],   // type 1 - Demandeurs
    assignees:  [],   // type 2 - Techniciens
    watchers:   [],   // type 3 - Observateurs
  })

  // ✅ NOUVEAU : Liste users disponibles
  const availableUsers = ref([])
  const loadingUsers = ref(false)

  const saving = ref(false)
  const error = ref(null)
  const successMsg = ref(null)

  const availableItems = ref([])
  const loadingItems = ref(false)

  // ============ GETTERS ============
  const isValid = computed(() => {
    return form.value.name.trim().length > 0 &&
           form.value.content.trim().length > 0
  })

  const totalActors = computed(() => {
    return actors.value.requesters.length +
           actors.value.assignees.length +
           actors.value.watchers.length
  })

  // ============ ACTIONS ============

  /** Charge la liste des utilisateurs GLPI */
  async function loadAvailableUsers() {
    loadingUsers.value = true
    try {
      availableUsers.value = await GlpiClient.getAllItemsWithDetails('User')
      console.log(`✅ ${availableUsers.value.length} utilisateurs chargés`)
    } catch (e) {
      console.error('❌ Erreur chargement users', e)
      availableUsers.value = []
    } finally {
      loadingUsers.value = false
    }
  }

  /** Ajouter un acteur (1=demandeur, 2=technicien, 3=observateur) */
  function addActor(user, type) {
    const key = getActorKey(type)
    if (!key) return false

    // Vérifier doublon
    const exists = actors.value[key].find(a => a.id === user.id)
    if (exists) return false

    actors.value[key].push({
      id: user.id,
      name: user.name,
      firstname: user.firstname,
      realname: user.realname,
    })
    return true
  }

  /** Retirer un acteur */
  function removeActor(userId, type) {
    const key = getActorKey(type)
    if (!key) return
    actors.value[key] = actors.value[key].filter(a => a.id !== userId)
  }

  function getActorKey(type) {
    return { 1: 'requesters', 2: 'assignees', 3: 'watchers' }[type] || null
  }

  /** Charger les items */
  async function loadAvailableItems() {
    loadingItems.value = true
    try {
      availableItems.value = await GlpiClient.fetchAllTypesItems()
    } catch (e) {
      console.error('Erreur', e)
      availableItems.value = []
    } finally {
      loadingItems.value = false
    }
  }

  function addItem(item) {
    const exists = selectedItems.value.find(
      i => i.id === item.id && i.itemtype === item._itemtype
    )
    if (exists) return false
    selectedItems.value.push({
      id: item.id,
      itemtype: item._itemtype,
      name: item.name,
      _typeLabel: item._typeLabel,
      _typeIcon: item._typeIcon,
    })
    return true
  }

  function removeItem(itemtype, id) {
    selectedItems.value = selectedItems.value.filter(
      i => !(i.id === id && i.itemtype === itemtype)
    )
  }

  function addCost() {
    costs.value.push({
      name: `Coût #${costs.value.length + 1}`,
      actiontime: 0,
      cost_time: 0,
      cost_fixed: 0,
      cost_material: 0,
    })
  }

  function removeCost(index) {
    costs.value.splice(index, 1)
  }

  /** Soumet le ticket avec acteurs */
  async function submitTicket() {
    if (!isValid.value) {
      error.value = 'Le titre et la description sont obligatoires'
      return null
    }

    saving.value = true
    error.value = null
    successMsg.value = null

    try {
      // 1. Créer le ticket
      const ticketId = await GlpiClient.createTicket({
        name: form.value.name,
        content: form.value.content,
        type: form.value.type,
        status: form.value.status,
        urgency: form.value.urgency,
        impact: form.value.impact,
        priority: form.value.priority,
        date: form.value.date.replace('T', ' ') + ':00',
      })

      console.log(`✅ Ticket #${ticketId} créé`)

      // 2. ✅ Lier les acteurs
      const actorPromises = []

      actors.value.requesters.forEach(user => {
        actorPromises.push(GlpiClient.addTicketActor(ticketId, user.id, 1))
      })
      actors.value.assignees.forEach(user => {
        actorPromises.push(GlpiClient.addTicketActor(ticketId, user.id, 2))
      })
      actors.value.watchers.forEach(user => {
        actorPromises.push(GlpiClient.addTicketActor(ticketId, user.id, 3))
      })

      const actorResults = await Promise.allSettled(actorPromises)
      const actorsOk = actorResults.filter(r => r.status === 'fulfilled').length
      console.log(`👥 Acteurs : ${actorsOk}/${actorPromises.length}`)

      // 3. Lier les éléments
      const itemResults = await Promise.allSettled(
        selectedItems.value.map(item =>
          GlpiClient.linkItemToTicket(ticketId, item.itemtype, item.id)
        )
      )
      const itemsOk = itemResults.filter(r => r.status === 'fulfilled').length

      // 4. Créer les coûts
      const costResults = await Promise.allSettled(
        costs.value.map(cost => GlpiClient.createTicketCost(ticketId, cost))
      )
      const costsOk = costResults.filter(r => r.status === 'fulfilled').length

      successMsg.value = `Ticket #${ticketId} créé avec succès ` +
                         `(${totalActors.value} acteur(s), ${itemsOk} élément(s), ${costsOk} coût(s))`

      return ticketId

    } catch (err) {
      error.value = err.response?.data?.[1] || err.message || 'Erreur création ticket'
      console.error('❌ Erreur', err)
      return null
    } finally {
      saving.value = false
    }
  }

  function reset() {
    form.value = {
      name: '', content: '',
      type: 1, status: 1,
      urgency: 3, impact: 3, priority: 3,
      date: new Date().toISOString().slice(0, 16),
    }
    selectedItems.value = []
    costs.value = []
    actors.value = { requesters: [], assignees: [], watchers: [] }
    error.value = null
    successMsg.value = null
  }

  return {
    form, selectedItems, costs, actors,
    saving, error, successMsg,
    availableItems, loadingItems,
    availableUsers, loadingUsers,
    isValid, totalActors,
    loadAvailableItems, loadAvailableUsers,
    addItem, removeItem,
    addActor, removeActor,
    addCost, removeCost,
    submitTicket, reset,
  }
})