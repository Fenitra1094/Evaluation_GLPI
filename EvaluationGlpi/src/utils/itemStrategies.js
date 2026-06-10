/**
 * Création d'items GLPI depuis import CSV
 * Stratégie universelle unique
 */

import GlpiClient from '@/api/glpiClient'

// =========================================================
// HELPER : Construit les dropdowns communs
// =========================================================
async function buildCommonDropdowns(row, statusMapping = {}) {
  const statusName = statusMapping[row.Status] || row.Status

  const [stateId, locationId, manufacturerId, userId] = await Promise.all([
    row.Status       ? GlpiClient.getOrCreateDropdown('State',        statusName)      : 0,
    row.Location     ? GlpiClient.getOrCreateDropdown('Location',     row.Location)    : 0,
    row.Manufacturer ? GlpiClient.getOrCreateDropdown('Manufacturer', row.Manufacturer): 0,
    row.User         ? GlpiClient.getOrCreateDropdown('User',         row.User)        : 0,
  ])

  return { stateId, locationId, manufacturerId, userId }
}

// =========================================================
// HELPER : Essaie de créer un Model si la ressource existe
// =========================================================
async function tryCreateModel(itemType, modelName, log) {
  if (!modelName) return null

  const modelResource = `${itemType}Model`
  try {
    const modelId = await GlpiClient.getOrCreateDropdown(modelResource, modelName)
    return {
      field: `${itemType.toLowerCase()}models_id`,
      id: modelId,
    }
  } catch (err) {
    log('info', `↳ ${itemType} n'a pas de Model, ignoré`)
    return null
  }
}

// =========================================================
// STRATÉGIE UNIVERSELLE (pour TOUS les types)
// =========================================================
async function universalStrategy(row, dropdowns, log) {
  const itemData = {
    name             : row.Name,
    serial           : row.Inventory_Number,
    otherserial      : row.Inventory_Number,
    states_id        : dropdowns.stateId,
    locations_id     : dropdowns.locationId,
    manufacturers_id : dropdowns.manufacturerId,
    users_id         : dropdowns.userId,
  }

  // Model dynamique (si supporté par le type)
  const model = await tryCreateModel(row.Item_Type, row.Model, log)
  if (model) itemData[model.field] = model.id

  return await GlpiClient.createItem(row.Item_Type, itemData)
}

// =========================================================
// FONCTION PRINCIPALE
// =========================================================
export async function createItemByType(row, statusMapping, logFn) {
  const log = logFn || (() => {})

  const dropdowns = await buildCommonDropdowns(row, statusMapping)

  return await universalStrategy(row, dropdowns, log)
}