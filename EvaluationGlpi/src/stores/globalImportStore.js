import { defineStore } from 'pinia'
import { ref } from 'vue'
import GlpiClient from '@/api/glpiClient'
import { glpiApi } from '@/api/glpi/core'
import { parseCSV, readFileAsText } from '@/utils/csvParser'
import { createItemByType } from '@/utils/itemStrategies'
import { createTicket } from '@/utils/ticketStrategies'
import { createTicketCost } from '@/utils/costStrategies'
import { readZipFile, uploadImageForAsset } from '@/utils/imageStrategies'

// =========================================================
// CONFIGURATION
// =========================================================
const STATUS_MAPPING = {
  'En production': 'Production',
  'En stock'     : 'Stock',
  'En panne'     : 'En panne',
  'Maintenance'  : 'Maintenance',
}

const ASSETS_REQUIRED  = ['Name', 'Item_Type', 'Inventory_Number']
const TICKETS_REQUIRED = ['Ref_Ticket', 'Titre', 'Type']
const COSTS_REQUIRED   = ['Num_Ticket']

// =========================================================
// STORE
// =========================================================
export const useGlobalImportStore = defineStore('globalImport', () => {

  // ---- FILES ----
  const assetsFile  = ref(null)
  const ticketsFile = ref(null)
  const costsFile   = ref(null)
  const imagesFile  = ref(null)

  // ---- PARSED DATA ----
  const assetsData  = ref({ headers: [], rows: [] })
  const ticketsData = ref({ headers: [], rows: [] })
  const costsData   = ref({ headers: [], rows: [] })

  // ---- ETAT ----
  const phase      = ref('idle')
  const errors     = ref([])
  const warnings   = ref([])
  const progress   = ref({ current: 0, total: 0, label: '' })
  const report     = ref(null)
  const debugLogs  = ref([])
  const createdIds = ref([])

  function addLog(type, message, data = null) {
    debugLogs.value.push({
      time: new Date().toLocaleTimeString(),
      type, message, data,
    })
  }

  // =========================================================
  // SÉLECTION DES FICHIERS
  // =========================================================
  async function setAssetsFile(file) {
    assetsFile.value = file
    if (file) {
      const text = await readFileAsText(file)
      assetsData.value = parseCSV(text)
    } else {
      assetsData.value = { headers: [], rows: [] }
    }
  }

  async function setTicketsFile(file) {
    ticketsFile.value = file
    if (file) {
      const text = await readFileAsText(file)
      ticketsData.value = parseCSV(text)
    } else {
      ticketsData.value = { headers: [], rows: [] }
    }
  }

  async function setCostsFile(file) {
    costsFile.value = file
    if (file) {
      const text = await readFileAsText(file)
      costsData.value = parseCSV(text)
    } else {
      costsData.value = { headers: [], rows: [] }
    }
  }

  function setImagesFile(file) {
    imagesFile.value = file
  }

  // =========================================================
  // VALIDATION GLOBALE
  // =========================================================
  function validate() {
    errors.value   = []
    warnings.value = []

    // === ASSETS ===
    if (assetsData.value.rows.length > 0) {
      const missing = ASSETS_REQUIRED.filter(c => !assetsData.value.headers.includes(c))
      if (missing.length > 0) {
        errors.value.push(`[Assets] Colonnes manquantes : ${missing.join(', ')}`)
      }

      const seenInv = new Set()
      assetsData.value.rows.forEach(row => {
        const line = row._lineNumber
        if (!row.Name)             errors.value.push(`[Assets] Ligne ${line} : Name manquant`)
        if (!row.Item_Type)        errors.value.push(`[Assets] Ligne ${line} : Item_Type manquant`)
        if (!row.Inventory_Number) errors.value.push(`[Assets] Ligne ${line} : Inventory_Number manquant`)

        if (row.Inventory_Number) {
          if (seenInv.has(row.Inventory_Number)) {
            errors.value.push(`[Assets] Ligne ${line} : doublon "${row.Inventory_Number}"`)
          }
          seenInv.add(row.Inventory_Number)
        }
      })
    }

    // === TICKETS ===
    if (ticketsData.value.rows.length > 0) {
      const missing = TICKETS_REQUIRED.filter(c => !ticketsData.value.headers.includes(c))
      if (missing.length > 0) {
        errors.value.push(`[Tickets] Colonnes manquantes : ${missing.join(', ')}`)
      }

      const seenRef = new Set()
      ticketsData.value.rows.forEach(row => {
        const line = row._lineNumber
        if (!row.Ref_Ticket) errors.value.push(`[Tickets] Ligne ${line} : Ref_Ticket manquant`)
        if (!row.Titre)      errors.value.push(`[Tickets] Ligne ${line} : Titre manquant`)
        if (!row.Type)       errors.value.push(`[Tickets] Ligne ${line} : Type manquant`)

        if (row.Ref_Ticket && seenRef.has(row.Ref_Ticket)) {
          errors.value.push(`[Tickets] Ligne ${line} : Ref_Ticket doublon "${row.Ref_Ticket}"`)
        }
        seenRef.add(row.Ref_Ticket)
      })
    }

    // === COÛTS ===
    if (costsData.value.rows.length > 0) {
      const missing = COSTS_REQUIRED.filter(c => !costsData.value.headers.includes(c))
      if (missing.length > 0) {
        errors.value.push(`[Coûts] Colonnes manquantes : ${missing.join(', ')}`)
      }

      // Les coûts nécessitent un fichier tickets
      if (ticketsData.value.rows.length === 0) {
        errors.value.push(`[Coûts] Le fichier Tickets est requis pour importer les coûts`)
      }

      costsData.value.rows.forEach(row => {
        const line = row._lineNumber
        if (!row.Num_Ticket) errors.value.push(`[Coûts] Ligne ${line} : Num_Ticket manquant`)
      })
    }

    // === IMAGES ===
    if (imagesFile.value && assetsData.value.rows.length === 0) {
      errors.value.push(`[Images] Le fichier Assets est requis pour importer les images`)
    }

    // === AU MOINS UN FICHIER ===
    if (
      assetsData.value.rows.length === 0 &&
      ticketsData.value.rows.length === 0 &&
      costsData.value.rows.length === 0 &&
      !imagesFile.value
    ) {
      errors.value.push('Aucun fichier chargé')
    }

    return errors.value.length === 0
  }

  // =========================================================
  // IMPORT GLOBAL (tout ou rien)
  // =========================================================
  async function importAll() {
    debugLogs.value  = []
    createdIds.value = []
    report.value     = null
    errors.value     = []

    addLog('info', '🚀 Début de l\'import global')

    if (!validate()) {
      phase.value = 'error'
      addLog('error', `Validation échouée : ${errors.value.length} erreur(s)`)
      return
    }

    phase.value = 'importing'

    const createdAssets  = []
    const createdTickets = []
    const createdCosts   = []
    const createdImages  = []

    // Map Ref_Ticket → ticketId GLPI (pour lier les coûts)
    const ticketsMap = new Map()

    let lastError  = null
    let failedRow  = null
    let failedFile = null

    try {
      // ═══════════════════════════════════════════
      // PHASE 1 : ASSETS
      // ═══════════════════════════════════════════
      if (assetsData.value.rows.length > 0) {
        addLog('info', `📦 PHASE 1 : ${assetsData.value.rows.length} assets`)

        for (let i = 0; i < assetsData.value.rows.length; i++) {
          const row = assetsData.value.rows[i]
          progress.value = {
            current: i + 1,
            total  : assetsData.value.rows.length,
            label  : `[Assets] ${row.Name} (${row.Item_Type})`,
          }

          addLog('info', `─── [Assets] Ligne ${row._lineNumber} : ${row.Name} ───`)

          try {
            const id = await createItemByType(row, STATUS_MAPPING, addLog)
            createdAssets.push({
              name: row.Name,
              id,
              type: row.Item_Type,
              line: row._lineNumber,
            })
            createdIds.value.push({ resource: row.Item_Type, id })
            addLog('success', `✅ ${row.Name} créé (id=${id})`)
          } catch (err) {
            lastError  = err
            failedRow  = row
            failedFile = 'Assets'
            throw err
          }
        }
      }

      // ═══════════════════════════════════════════
      // PHASE 2 : TICKETS
      // ═══════════════════════════════════════════
      if (ticketsData.value.rows.length > 0) {
        addLog('info', `🎫 PHASE 2 : ${ticketsData.value.rows.length} tickets`)

        for (let i = 0; i < ticketsData.value.rows.length; i++) {
          const row = ticketsData.value.rows[i]
          progress.value = {
            current: i + 1,
            total  : ticketsData.value.rows.length,
            label  : `[Tickets] ${row.Titre}`,
          }

          addLog('info', `─── [Tickets] Ligne ${row._lineNumber} : ${row.Titre} ───`)

          try {
            const result = await createTicket(row, addLog)
            createdTickets.push({
              titre    : row.Titre,
              id       : result.ticketId,
              refTicket: row.Ref_Ticket,
              line     : row._lineNumber,
              linkedItems: result.linkedItems,
            })

            // Stocker la correspondance Ref_Ticket → ticketId GLPI
            ticketsMap.set(String(row.Ref_Ticket), result.ticketId)

            createdIds.value.push({ resource: 'Ticket', id: result.ticketId })
            result.linkedItems.forEach(item => {
              createdIds.value.push({ resource: 'Item_Ticket', id: item.linkId })
            })

            addLog('success', `✅ Ticket "${row.Titre}" créé (id=${result.ticketId})`)
          } catch (err) {
            lastError  = err
            failedRow  = row
            failedFile = 'Tickets'
            throw err
          }
        }
      }

      // ═══════════════════════════════════════════
      // PHASE 3 : COÛTS
      // ═══════════════════════════════════════════
      if (costsData.value.rows.length > 0) {
        addLog('info', `💰 PHASE 3 : ${costsData.value.rows.length} coûts`)

        for (let i = 0; i < costsData.value.rows.length; i++) {
          const row = costsData.value.rows[i]
          progress.value = {
            current: i + 1,
            total  : costsData.value.rows.length,
            label  : `[Coûts] Ticket Ref=${row.Num_Ticket}`,
          }

          addLog('info', `─── [Coûts] Ligne ${row._lineNumber} : Ref=${row.Num_Ticket} ───`)

          try {
            const result = await createTicketCost(row, ticketsMap, addLog)
            createdCosts.push({
              costId   : result.costId,
              refTicket: result.refTicket,
              ticketId : result.ticketId,
              line     : row._lineNumber,
            })
            createdIds.value.push({ resource: 'TicketCost', id: result.costId })
            addLog('success', `✅ Coût créé (id=${result.costId})`)
          } catch (err) {
            lastError  = err
            failedRow  = row
            failedFile = 'Coûts'
            throw err
          }
        }
      }

      // ═══════════════════════════════════════════
      // PHASE 4 : IMAGES (depuis ZIP)
      // ═══════════════════════════════════════════
      if (imagesFile.value) {
        addLog('info', `🖼️ PHASE 4 : Décompression du ZIP...`)

        const images = await readZipFile(imagesFile.value)
        addLog('info', `   📂 ${images.length} image(s) trouvée(s) dans le ZIP`)

        for (let i = 0; i < images.length; i++) {
          const img = images[i]
          progress.value = {
            current: i + 1,
            total  : images.length,
            label  : `[Images] ${img.filename}`,
          }

          addLog('info', `─── [Images] ${img.filename} ───`)

          try {
            const result = await uploadImageForAsset(img, addLog)
            if (result) {
              createdImages.push({
                filename : img.filename,
                assetName: result.assetName,
                docId    : result.documentId,
                linkId   : result.linkId,
              })
              createdIds.value.push({ resource: 'Document', id: result.documentId })
              if (result.linkId) {
                createdIds.value.push({ resource: 'Document_Item', id: result.linkId })
              }
            }
          } catch (err) {
            lastError  = err
            failedRow  = { filename: img.filename }
            failedFile = 'Images'
            throw err
          }
        }
      }

      // ═══════════════════════════════════════════
      // SUCCÈS
      // ═══════════════════════════════════════════
      report.value = {
        success: createdAssets.length + createdTickets.length + createdCosts.length + createdImages.length,
        failed : 0,
        assets : createdAssets,
        tickets: createdTickets,
        costs  : createdCosts,
        images : createdImages,
      }
      phase.value = 'done'
      addLog('success', `🎉 IMPORT GLOBAL TERMINÉ !`)
      addLog('success', `   📦 ${createdAssets.length} assets`)
      addLog('success', `   🎫 ${createdTickets.length} tickets`)
      addLog('success', `   💰 ${createdCosts.length} coûts`)
      addLog('success', `   🖼️ ${createdImages.length} images`)

    } catch (err) {
      // ROLLBACK GLOBAL
      addLog('error', `❌ Erreur dans ${failedFile} : ${err.message}`)
      addLog('warning', `⚠️ ROLLBACK GLOBAL de ${createdIds.value.length} éléments...`)

      progress.value = {
        current: 0,
        total  : createdIds.value.length,
        label  : '⚠️ Rollback global en cours...',
      }

      await rollback()

      report.value = {
        success      : 0,
        failed       : 1,
        rollbackDone : true,
        errorMessage : err.message,
        failedFile,
        failedRow,
        failedLine   : failedRow?._lineNumber,
      }
      phase.value = 'error'
      addLog('error', `❌ Import annulé. Aucune donnée conservée.`)
    }
  }

  // =========================================================
  // ROLLBACK GLOBAL
  // =========================================================
  async function rollback() {
    const toDelete = [...createdIds.value].reverse()

    let success = 0
    let failed  = 0

    for (const item of toDelete) {
      try {
        await GlpiClient.deleteItem(item.resource, item.id)
        success++
        addLog('info', `🗑️ Rollback ${item.resource}#${item.id}`)
      } catch (err) {
        failed++
        addLog('error', `❌ Erreur rollback ${item.resource}#${item.id}`)
      }
    }

    addLog('warning', `🏁 Rollback : ${success} OK, ${failed} échecs`)
    createdIds.value = []
  }

  // =========================================================
  // RESET
  // =========================================================
  function reset() {
    assetsFile.value  = null
    ticketsFile.value = null
    costsFile.value   = null
    imagesFile.value  = null
    assetsData.value  = { headers: [], rows: [] }
    ticketsData.value = { headers: [], rows: [] }
    costsData.value   = { headers: [], rows: [] }
    errors.value      = []
    warnings.value    = []
    debugLogs.value   = []
    report.value      = null
    createdIds.value  = []
    phase.value       = 'idle'
    progress.value    = { current: 0, total: 0, label: '' }
  }

  return {
    assetsFile, ticketsFile, costsFile, imagesFile,
    assetsData, ticketsData, costsData,
    phase, errors, warnings, progress, report, debugLogs,
    setAssetsFile, setTicketsFile, setCostsFile, setImagesFile,
    validate, importAll, reset,
  }
})