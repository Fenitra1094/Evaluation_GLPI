import { defineStore } from 'pinia'
import { ref } from 'vue'
import LocalApi from '@/api/localClient'
import GlpiClient from '@/api/glpiClient'
import { parseCSV, readFileAsText } from '@/utils/csvParser'

const REQUIRED_COLUMNS = [
  'Ref_Ticket', 'Mvt', 'Valeur'
]

const MVT_MAPPING = {
  'Reopen': 'Open',
  'Cancel'     : 'Cancel',
  'Close'     : 'Close',
}

export const useImportStore = defineStore('import', () => {

  // ---- STATE ----
  const file        = ref(null)
  const rows        = ref([])
  const headers     = ref([])
  const errors      = ref([])
  const warnings    = ref([])
  const phase       = ref('idle')
  const progress    = ref({ current: 0, total: 0, label: '' })
  const report      = ref(null)
  const createdIds  = ref([])
  const debugLogs   = ref([])   // 🆕 logs détaillés
  const ticketsMap = new Map()
  // =========================================================
  // Helper : Ajouter un log
  // =========================================================
  function addLog(type, message, data = null) {
    debugLogs.value.push({
      time   : new Date().toLocaleTimeString(),
      type,        // 'info' | 'success' | 'error' | 'warning'
      message,
      data,
    })
  }

  // =========================================================
  // Lire le fichier
  // =========================================================
  async function loadFile(selectedFile) {
    file.value       = selectedFile
    rows.value       = []
    headers.value    = []
    errors.value     = []
    warnings.value   = []
    debugLogs.value  = []
    report.value     = null
    phase.value      = 'parsing'

    try {
      const text   = await readFileAsText(selectedFile)
      const parsed = parseCSV(text)

      headers.value = parsed.headers
      rows.value    = parsed.rows
      phase.value   = 'idle'
      return true
    } catch (err) {
      errors.value.push(`Erreur lecture : ${err.message}`)
      phase.value = 'error'
      return false
    }
  }

  // =========================================================
  // Validation
  // =========================================================
  function validate() {
    errors.value   = []
    warnings.value = []
    phase.value    = 'validating'

    const missingCols = REQUIRED_COLUMNS.filter(c => !headers.value.includes(c))
    if (missingCols.length > 0) {
      errors.value.push(`Colonnes manquantes : ${missingCols.join(', ')}`)
    }

    const seenTicket = new Set()
    const seenMvt    = new Set()
    const seenValeur    = new Set()

    rows.value.forEach((row) => {
      const line = row._lineNumber

      if (!row.Ref_Ticket)             errors.value.push(`Ligne ${line} : Ref_Ticket manquant`)
      if (!row.Mvt)        errors.value.push(`Ligne ${line} : Mvt manquant`)
      if (!row.Valeur){ row.valeur = 0 }

    })

    phase.value = errors.value.length > 0 ? 'error' : 'idle'
    return errors.value.length === 0
  }
  function parseFloatFr(value) {
  if (!value) return 0
  return parseFloat(String(value).replace(',', '.')) || 0
}



  // =========================================================
  // Importer
  // =========================================================
  async function importAll() {
    debugLogs.value = []
    const allTickets = ref([])
    let lastErrorr = null
    
    const ticketMap = new Map()


    const ok = validate()
    if (!ok) {
      phase.value = 'error'
      addLog('error', 'Validation échouée', errors.value)
      return
    }

    phase.value      = 'importing'
    createdIds.value = []
    const created    = []

    addLog('info', `🚀 Début import de ${rows.value.length} lignes`)

    let lastError = null
    let failedRow = null

    try {
      const total = rows.value.length
      allTickets.value = await GlpiClient.getTickets({
        order : 'ASC',
      })

      allTickets.value.forEach((ticket, index) => {
        const ref_ticket = String(index + 1)
        ticketMap.set(ref_ticket, ticket.id)
      })

      for (let i = 0; i < rows.value.length; i++) {
        const row = rows.value[i]
        progress.value = {
          current: i + 1,
          total,
          label  : `Cout ${row.Mvt})`
        }
       

        try {
          const id = await createOneRow(row, ticketMap)
          created.push({ id, Ref_Ticket: row.Ref_Ticket, Mvt: row.Mvt, Valeur: row.Valeur })
          createdIds.value.push({ id })
          addLog('success', `✅ ${row.Mvt} créé (id=${id})`)

        } catch (err) {
          lastError = err
          failedRow = row
          addLog('error', `❌ Échec ${row.Mvt} : ${err.message}`, {
            row,
            stack: err.stack,
          })
          throw err
        }
      }

      report.value = {
        success: created.length,
        failed : 0,
        details: created,
      }
      phase.value = 'done'
      addLog('success', `🎉 Import terminé : ${created.length} éléments créés`)

    } catch (err) {
      // ROLLBACK
      addLog('warning', `⚠️ Rollback de ${createdIds.value.length} éléments...`)
      progress.value = {
        current: 0,
        total  : createdIds.value.length,
        label  : '⚠️ Rollback en cours...'
      }

      await rollback()

      report.value = {
        success        : 0,
        failed         : 1,
        rollbackDone   : true,
        errorMessage   : err.message,
        failedRow,
        failedLine     : failedRow?._lineNumber,
        failedName     : failedRow?.Name,
        details        : [],
      }
      phase.value = 'error'
      addLog('error', `❌ Import annulé : ${err.message}`)
    }
  }
    async function createOneRow(row, ticketMap) {
        const mvtName = MVT_MAPPING[row.Mvt] || row.Mvt
        const refTicket = String(row.Ref_Ticket)
        const idTicket = ticketMap.get(refTicket)
        const type = ref('')
        if(row.Mvt === "Open"){
          type.value = "REOUVERTURE"
          const val = parseFloatFr(row.Valeur)
          try{
              console.log(`🔄 Réouverture : ${val}% pour ticket #${idTicket}`)
              await LocalApi.addPourcentage(idTicket, val) 
              return
            }
            catch (e) { console.warn('⚠️ Erreur pourcentage', e.message) }
            
          
        } 
        if(row.Mvt === "Close") type.value = "SAISI"
        if(row.Mvt === "Cancel") {
            try{
              await LocalApi.AnnulerCout(idTicket)
              return
            }
            catch(err){
              addLog('Error', `Ticket non trouve`)

            }
        }
  
        const itemData = {
            ticket             : idTicket,
            cout          : parseFloatFr(row.Valeur) || 0 ,
            type      : type.value,
        }


        return await LocalApi.createItem(itemData)
    }
  // =========================================================
  // Rollback
  // =========================================================
  async function rollback() {
    for (const item of createdIds.value) {
      try {
        await GlpiClient.deleteItem(item.resource, item.id)
        addLog('info', `🗑️ Supprimé ${item.resource}#${item.id}`)
      } catch (err) {
        addLog('error', `Erreur rollback ${item.resource}#${item.id}`)
      }
    }
    createdIds.value = []
  }

  function reset() {
    file.value       = null
    rows.value       = []
    headers.value    = []
    errors.value     = []
    warnings.value   = []
    debugLogs.value  = []
    report.value     = null
  //  createdIds.value = []
    phase.value      = 'idle'
    progress.value   = { current: 0, total: 0, label: '' }
  }

  return {
    file, rows, headers, errors, warnings,
    phase, progress, report, debugLogs,
    loadFile, validate, importAll, reset,
  }
})