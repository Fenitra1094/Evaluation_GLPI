import { defineStore } from 'pinia'
import { ref } from 'vue'
import GlpiClient from '@/api/glpiClient'
import { useKanbanStore } from './FrontOffice/kanbanStore'    // ⭐ Importer le store kanban
import { parseCSV, readFileAsText } from '@/utils/csvParser'

const REQUIRED_COLUMNS = ['Ref_Ticket', 'Mvt', 'Valeur']

export const useImportStore = defineStore('import', () => {

  // ---- STATE ----
  const file       = ref(null)
  const rows       = ref([])
  const headers    = ref([])
  const errors     = ref([])
  const warnings   = ref([])
  const phase      = ref('idle')
  const progress   = ref({ current: 0, total: 0, label: '' })
  const report     = ref(null)
  const debugLogs  = ref([])

  // ⭐ Référencer le store kanban pour ses fonctions
  const kanban = useKanbanStore()

  // =========================================================
  // Helpers
  // =========================================================
  function addLog(type, message, data = null) {
    debugLogs.value.push({
      time: new Date().toLocaleTimeString(),
      type, message, data,
    })
  }

  function parseFloatFr(value) {
    if (!value) return 0
    return parseFloat(String(value).replace(',', '.')) || 0
  }

  // =========================================================
  // Lire le fichier
  // =========================================================
  async function loadFile(selectedFile) {
    file.value      = selectedFile
    rows.value      = []
    headers.value   = []
    errors.value    = []
    warnings.value  = []
    debugLogs.value = []
    report.value    = null
    phase.value     = 'parsing'

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

    rows.value.forEach((row) => {
      const line = row._lineNumber
      if (!row.Ref_Ticket) errors.value.push(`Ligne ${line} : Ref_Ticket manquant`)
      if (!row.Mvt)        errors.value.push(`Ligne ${line} : Mvt manquant`)
      if (!row.Valeur)     row.Valeur = 0
    })

    phase.value = errors.value.length > 0 ? 'error' : 'idle'
    return errors.value.length === 0
  }

  // =========================================================
  // Traiter une ligne CSV
  // =========================================================
  async function processRow(row, ticketMap) {
    const refTicket = String(row.Ref_Ticket)
    const idTicket  = ticketMap.get(refTicket)

    if (!idTicket) {
      throw new Error(`Ticket Ref=${refTicket} non trouvé`)
    }

    const valeur = parseFloatFr(row.Valeur)
    const mvt    = row.Mvt?.trim()

    // ⭐ Utiliser les fonctions du kanban store
    switch (mvt) {
      case 'Close':
        addLog('info', `💰 Close : ${valeur}€ → ticket #${idTicket}`)
        return await kanban.createSaisi(idTicket, valeur)

      case 'Cancel':
        addLog('info', `🔄 Cancel → ticket #${idTicket}`)
        return await kanban.createCancel(idTicket)

      case 'Open':
      case 'Reopen':
        addLog('info', `🔄 Reopen : ${valeur}% → ticket #${idTicket}`)
        return await kanban.createReouverture(idTicket, valeur)

      default:
        throw new Error(`Mvt inconnu : "${mvt}"`)
    }
  }

  // =========================================================
  // Import principal
  // =========================================================
  async function importAll() {
    debugLogs.value = []

    if (!validate()) {
      phase.value = 'error'
      addLog('error', 'Validation échouée', errors.value)
      return
    }

    phase.value = 'importing'
    const success = []
    const failed  = []

    addLog('info', `🚀 Début import de ${rows.value.length} lignes`)

    try {
      // 1. Récupérer tous les tickets pour mapper Ref_Ticket → ID GLPI
      addLog('info', '📥 Chargement des tickets GLPI...')
      const allTickets = await GlpiClient.getTickets({ order: 'ASC' })

      const ticketMap = new Map()
      allTickets.forEach((ticket, index) => {
        const refTicket = String(index + 1)
        ticketMap.set(refTicket, ticket.id)
      })

      addLog('info', `✅ ${allTickets.length} tickets chargés`)

      // 2. Traiter chaque ligne
      for (let i = 0; i < rows.value.length; i++) {
        const row = rows.value[i]
        progress.value = {
          current: i + 1,
          total  : rows.value.length,
          label  : `${row.Mvt} pour Ref=${row.Ref_Ticket}`,
        }

        try {
          await processRow(row, ticketMap)
          success.push({
            line: row._lineNumber,
            mvt: row.Mvt,
            refTicket: row.Ref_Ticket,
          })
          addLog('success', `✅ Ligne ${row._lineNumber} : ${row.Mvt} OK`)

        } catch (err) {
          failed.push({
            line: row._lineNumber,
            mvt: row.Mvt,
            refTicket: row.Ref_Ticket,
            error: err.message,
          })
          addLog('error', `❌ Ligne ${row._lineNumber} : ${err.message}`)
          // ⭐ On continue (pas de rollback global, chaque ligne est indépendante)
        }
      }

      report.value = {
        success: success.length,
        failed : failed.length,
        details: { success, failed },
      }

      phase.value = failed.length === 0 ? 'done' : 'partial'
      addLog('success', `🎉 Import terminé : ${success.length} OK, ${failed.length} échecs`)

    } catch (err) {
      addLog('error', `❌ Erreur globale : ${err.message}`)
      report.value = {
        success: success.length,
        failed : failed.length + 1,
        errorMessage: err.message,
      }
      phase.value = 'error'
    }
  }

  function reset() {
    file.value      = null
    rows.value      = []
    headers.value   = []
    errors.value    = []
    warnings.value  = []
    debugLogs.value = []
    report.value    = null
    phase.value     = 'idle'
    progress.value  = { current: 0, total: 0, label: '' }
  }

  return {
    file, rows, headers, errors, warnings,
    phase, progress, report, debugLogs,
    loadFile, validate, importAll, reset,
  }
})