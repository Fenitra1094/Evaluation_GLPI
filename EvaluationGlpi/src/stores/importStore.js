import { defineStore } from 'pinia'
import { ref } from 'vue'
import GlpiClient from '@/api/glpiClient'
import { parseCSV, readFileAsText } from '@/utils/csvParser'

const REQUIRED_COLUMNS = [
  'Name', 'Status', 'Location', 'Manufacturer',
  'Item_Type', 'Model', 'Inventory_Number', 'User'
]

const STATUS_MAPPING = {
  'En production': 'Production',
  'En stock'     : 'Stock',
  'En panne'     : 'En panne',
  'Maintenance'  : 'Maintenance',
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

    const seenInventory = new Set()
    const seenNames     = new Set()

    rows.value.forEach((row) => {
      const line = row._lineNumber

      if (!row.Name)             errors.value.push(`Ligne ${line} : Name manquant`)
      if (!row.Item_Type)        errors.value.push(`Ligne ${line} : Item_Type manquant`)
      if (!row.Inventory_Number) errors.value.push(`Ligne ${line} : Inventory_Number manquant`)

      if (row.Inventory_Number) {
        if (seenInventory.has(row.Inventory_Number)) {
          errors.value.push(`Ligne ${line} : Inventory_Number doublon "${row.Inventory_Number}"`)
        }
        seenInventory.add(row.Inventory_Number)
      }

      if (row.Name) {
        if (seenNames.has(row.Name)) {
          errors.value.push(`Ligne ${line} : Name doublon "${row.Name}"`)
        }
        seenNames.add(row.Name)
      }

      if (!row.User) {
        warnings.value.push(`Ligne ${line} : User vide pour "${row.Name}"`)
      }
    })

    phase.value = errors.value.length > 0 ? 'error' : 'idle'
    return errors.value.length === 0
  }

  // =========================================================
  // Importer
  // =========================================================
  async function importAll() {
    debugLogs.value = []

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

      for (let i = 0; i < rows.value.length; i++) {
        const row = rows.value[i]
        progress.value = {
          current: i + 1,
          total,
          label  : `Ligne ${row._lineNumber} : ${row.Name} (${row.Item_Type})`
        }

        addLog('info', `─── Ligne ${row._lineNumber} : ${row.Name} ───`)

        try {
          const id = await createOneRow(row)
          created.push({ name: row.Name, id, type: row.Item_Type, line: row._lineNumber })
          createdIds.value.push({ resource: row.Item_Type, id })
          addLog('success', `✅ ${row.Name} créé (id=${id})`)

        } catch (err) {
          lastError = err
          failedRow = row
          addLog('error', `❌ Échec ${row.Name} : ${err.message}`, {
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
    async function createOneRow(row) {
        const statusName = STATUS_MAPPING[row.Status] || row.Status

        // ✅ Si vide → 0 au lieu de null
        const stateId        = row.Status       ? await GlpiClient.getOrCreateDropdown('State', statusName)        : 0
        const locationId     = row.Location     ? await GlpiClient.getOrCreateDropdown('Location', row.Location)   : 0
        const manufacturerId = row.Manufacturer ? await GlpiClient.getOrCreateDropdown('Manufacturer', row.Manufacturer) : 0

        const modelResource  = `${row.Item_Type}Model`
        const modelId        = row.Model ? await GlpiClient.getOrCreateDropdown(modelResource, row.Model) : 0

        const userId         = row.User ? await GlpiClient.getOrCreateDropdown('User', row.User) : 0

        const itemData = {
            name             : row.Name,
            serial           : row.Inventory_Number,
            otherserial      : row.Inventory_Number,
            states_id        : stateId,
            locations_id     : locationId,
            manufacturers_id : manufacturerId,
            users_id         : userId,
        }

        const modelFieldName = `${row.Item_Type.toLowerCase()}models_id`
        itemData[modelFieldName] = modelId

        return await GlpiClient.createItem(row.Item_Type, itemData)
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
    createdIds.value = []
    phase.value      = 'idle'
    progress.value   = { current: 0, total: 0, label: '' }
  }

  return {
    file, rows, headers, errors, warnings,
    phase, progress, report, debugLogs,
    loadFile, validate, importAll, reset,
  }
})