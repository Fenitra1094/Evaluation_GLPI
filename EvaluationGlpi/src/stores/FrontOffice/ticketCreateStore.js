import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GlpiClient from '@/api/glpiClient'

export const useTicketCreateStore = defineStore('ticketCreate', () => {
    // State formulaire 
    const form = ref({
        name :'',
        conetnt : '',
        type     : 1,                                    // 1=Incident, 2=Demande
        status   : 1,                                    // 1=Nouveau
        urgency  : 3,
        impact   : 3,
        priority : 3,
        date     : new Date().toISOString().slice(0, 16),  // datetime-local
    })

    // Les elements associes 
    const selectedItems = ref([])

    // Les couts 
    const costs = ref([])

    //Etat de l'engistrement
    const saving = ref(false)
    const error = ref(null)
    const successMsg = ref(null)

    // Liste des items disponibles
    const availableItems = ref([])
    const loadingItems = ref(false)

    // Getters
    const isValid = computed(() => {
        return form.value.name.trim().length > 0 && 
            form.value.content.trim().length > 0
    })

    // ACTIONS 

    /** charge tous les items disponible pour la selection */
    async function loadAvailableItems(){
        loadingItems.value = true
        try{
            availableItems.value = await GlpiClient.fetchAllTypesItems()
        }
        catch(e){
            console.errror('Erreur lors de chargement de items', e)
            availableItems.value = []

        }
        finally{
            loadingItems.value = false
        }
    }

    function addItem(item){
        const exists = selectedItems.value.find(
            i => i.id === item.id && i.itemtype === item._itemtype
        )
        if(exists) return false
        selectedItems.value.push({
            id : item.id,
            itemtype : item._itemtype,
            name      : item.name,
            _typeLabel: item._typeLabel,
            _typeIcon : item._typeIcon,
        })
        return true
    }

    /**
   * Retirer un élément
   */
  function removeItem(itemtype, id) {
    selectedItems.value = selectedItems.value.filter(
      i => !(i.id === id && i.itemtype === itemtype)
    )
  } 

  /** ajouter un cout vide */
  function addCost(){
    costs.value.push({
        name : `cout #${costs.value.length +1 }`,
        actiontime : 0,
        cost_time : 0,
        cost_fixed : 0,
        cost_material : 0,
    })
  }

  /**
   * Retirer un coût par index
   */
  function removeCost(index) {
    costs.value.splice(index, 1)
  } 

  /** Cree le ticket complet(element + couts) */
  async function submitTicket(){
    if(!isValid.value){
        error.value = ' Le titre et le description sont obligatoires'
        return null
    }
    
    saving.value     = true
    error.value      = null
    successMsg.value = null 

    try{
        // cree le ticket 
        const ticketId = await GlpiClient.createTicket({
            name     : form.value.name,
            content  : form.value.content,
            type     : form.value.type,
            status   : form.value.status,
            urgency  : form.value.urgency,
            impact   : form.value.impact,
            priority : form.value.priority,
            date     : form.value.date.replace('T', ' ') + ':00',
        })      
          console.log(`✅ Ticket créé : #${ticketId}`)

        // Lier le elements
        const itemResults = await Promise.allSettled(
            selectedItems.value.map(item =>
                GlpiClient.linkItemToTicket(ticketId, item.itemtype, item.id)
            )
        )
        const itemsOk     = itemResults.filter(r => r.status === 'fulfilled').length
        const itemsFailed = itemResults.filter(r => r.status === 'rejected').length

        // creer les couts
         const costResults = await Promise.allSettled(
        costs.value.map(cost =>
          GlpiClient.createTicketCost(ticketId, cost)
        )
      )

      const costsOk     = costResults.filter(r => r.status === 'fulfilled').length
    const costsFailed = costResults.filter(r => r.status === 'rejected').length

     console.log(`💰 Coûts : ${costsOk} ok, ${costsFailed} échec`)

      successMsg.value = `Ticket #${ticketId} créé avec succès ` +
                         `(${itemsOk} élément(s), ${costsOk} coût(s))`

      return ticketId 

    }
    catch(err){
        error.value = err.response?.data?.[1] || err.message || 'Erreur création ticket'
        console.error('❌ Erreur création ticket', err)
        return null
    }
    finally {
      saving.value = false
    }
  }

  /**
   * Réinitialise le formulaire
   */
  function reset() {
    form.value = {
      name     : '',
      content  : '',
      type     : 1,
      status   : 1,
      urgency  : 3,
      impact   : 3,
      priority : 3,
      date     : new Date().toISOString().slice(0, 16),
    }
    selectedItems.value = []
    costs.value         = []
    error.value         = null
    successMsg.value    = null
  }

  return {
    // state
    form, selectedItems, costs,
    saving, error, successMsg,
    availableItems, loadingItems,
    // getters
    isValid,
    // actions
    loadAvailableItems,
    addItem, removeItem,
    addCost, removeCost,
    submitTicket, reset,
  }

})