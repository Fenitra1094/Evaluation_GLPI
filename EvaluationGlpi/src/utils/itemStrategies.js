/**
 * Stratégies de création pour chaque Item_Type GLPI
 */

import GlpiClient from '@/api/glpiClient'

// =========================================================
// HELPER : Crée les dropdowns communs
// =========================================================
async function buildCommonDropdowns(row, statusMapping = {}) {
  const statusName = statusMapping[row.Status] || row.Status

  return {
    stateId        : row.Status       ? await GlpiClient.getOrCreateDropdown('State', statusName) : 0,
    locationId     : row.Location     ? await GlpiClient.getOrCreateDropdown('Location', row.Location) : 0,
    manufacturerId : row.Manufacturer ? await GlpiClient.getOrCreateDropdown('Manufacturer', row.Manufacturer) : 0,
    userId         : row.User         ? await GlpiClient.getOrCreateDropdown('User', row.User) : 0,
  }
}

// =========================================================
// STRATÉGIE STANDARD (Computer, Monitor, Printer, Phone, etc.)
// =========================================================
async function standardAssetStrategy(row, dropdowns, log) {
  const { stateId, locationId, manufacturerId, userId } = dropdowns

  const modelResource = `${row.Item_Type}Model`
  let modelId = 0
  if (row.Model) {
    try {
      modelId = await GlpiClient.getOrCreateDropdown(modelResource, row.Model)
    } catch (err) {
      log('warning', `⚠️ ${modelResource} non disponible, Model ignoré`)
    }
  }

  const itemData = {
    name             : row.Name,
    serial           : row.Inventory_Number,
    otherserial      : row.Inventory_Number,
    states_id        : stateId,
    locations_id     : locationId,
    manufacturers_id : manufacturerId,
    users_id         : userId,
  }

  if (modelId) {
    const modelFieldName = `${row.Item_Type.toLowerCase()}models_id`
    itemData[modelFieldName] = modelId
  }

  return await GlpiClient.createItem(row.Item_Type, itemData)
}

// =========================================================
// STRATÉGIE SOFTWARE
// =========================================================
async function softwareStrategy(row, dropdowns, log) {
  const { stateId, manufacturerId, userId } = dropdowns

  const softwareData = {
    name             : row.Name,
    comment          : `Modèle: ${row.Model || 'N/A'} | Inventaire: ${row.Inventory_Number}`,
    manufacturers_id : manufacturerId,
    users_id         : userId,
    states_id        : stateId,
  }

  const softwareId = await GlpiClient.createItem('Software', softwareData)
  log('info', `📦 Software créé (id=${softwareId})`)

  if (row.Model) {
    try {
      const versionId = await GlpiClient.createItem('SoftwareVersion', {
        name         : row.Model,
        softwares_id : softwareId,
        comment      : `Version importée le ${new Date().toLocaleDateString()}`,
      })
      log('info', `📦 SoftwareVersion créée (id=${versionId})`)
    } catch (err) {
      log('warning', `⚠️ SoftwareVersion non créée : ${err.message}`)
    }
  }

  return softwareId
}

// =========================================================
// STRATÉGIE CARTRIDGE (Cartouches)
// =========================================================
async function cartridgeStrategy(row, dropdowns, log) {
  const { stateId, locationId, manufacturerId } = dropdowns

  let cartridgeItemId = 0
  if (row.Model) {
    const existing = await GlpiClient.findDropdownByName('CartridgeItem', row.Model)
    if (existing) {
      cartridgeItemId = existing
      log('info', `↳ CartridgeItem "${row.Model}" déjà existant`)
    } else {
      cartridgeItemId = await GlpiClient.createItem('CartridgeItem', {
        name             : row.Model,
        manufacturers_id : manufacturerId,
        ref              : row.Inventory_Number,
      })
      log('info', `↳ CartridgeItem créé (id=${cartridgeItemId})`)
    }
  }

  const cartridgeData = {
    name                : row.Name,
    cartridgeitems_id   : cartridgeItemId,
    states_id           : stateId,
    locations_id        : locationId,
  }

  return await GlpiClient.createItem('Cartridge', cartridgeData)
}

// =========================================================
// STRATÉGIE CONSUMABLE
// =========================================================
async function consumableStrategy(row, dropdowns, log) {
  const { stateId, locationId, manufacturerId } = dropdowns

  let consumableItemId = 0
  if (row.Model) {
    const existing = await GlpiClient.findDropdownByName('ConsumableItem', row.Model)
    if (existing) {
      consumableItemId = existing
      log('info', `↳ ConsumableItem "${row.Model}" déjà existant`)
    } else {
      consumableItemId = await GlpiClient.createItem('ConsumableItem', {
        name             : row.Model,
        manufacturers_id : manufacturerId,
        ref              : row.Inventory_Number,
      })
      log('info', `↳ ConsumableItem créé (id=${consumableItemId})`)
    }
  }

  const consumableData = {
    name                : row.Name,
    consumableitems_id  : consumableItemId,
    states_id           : stateId,
    locations_id        : locationId,
  }

  return await GlpiClient.createItem('Consumable', consumableData)
}

// =========================================================
// STRATÉGIE CABLE
// =========================================================
async function cableStrategy(row, dropdowns, log) {
  const { stateId, locationId, manufacturerId, userId } = dropdowns

  const cableData = {
    name             : row.Name,
    otherserial      : row.Inventory_Number,
    states_id        : stateId,
    locations_id     : locationId,
    manufacturers_id : manufacturerId,
    users_id         : userId,
    comment          : `Modèle: ${row.Model || 'N/A'}`,
  }

  return await GlpiClient.createItem('Cable', cableData)
}

// =========================================================
// STRATÉGIE CERTIFICATE
// =========================================================
async function certificateStrategy(row, dropdowns, log) {
  const { stateId, locationId, manufacturerId, userId } = dropdowns

  const certData = {
    name             : row.Name,
    serial           : row.Inventory_Number,
    states_id        : stateId,
    locations_id     : locationId,
    manufacturers_id : manufacturerId,
    users_id         : userId,
    comment          : `Type: ${row.Model || 'N/A'}`,
  }

  return await GlpiClient.createItem('Certificate', certData)
}

// =========================================================
// STRATÉGIE SOFTWARELICENSE
// =========================================================
async function softwareLicenseStrategy(row, dropdowns, log) {
  const { manufacturerId, userId } = dropdowns

  let softwareId = await GlpiClient.findDropdownByName('Software', row.Name)
  if (!softwareId) {
    softwareId = await GlpiClient.createItem('Software', {
      name             : row.Name,
      manufacturers_id : manufacturerId,
    })
    log('info', `↳ Software parent créé (id=${softwareId})`)
  }

  const licenseData = {
    name         : row.Name,
    softwares_id : softwareId,
    serial       : row.Inventory_Number,
    users_id     : userId,
    comment      : `Modèle: ${row.Model || 'N/A'}`,
  }

  return await GlpiClient.createItem('SoftwareLicense', licenseData)
}

// =========================================================
// MAPPING DES STRATÉGIES PAR TYPE
// =========================================================
const STRATEGIES = {
  // Standards
  'Computer'          : standardAssetStrategy,
  'Monitor'           : standardAssetStrategy,
  'Printer'           : standardAssetStrategy,
  'Phone'             : standardAssetStrategy,
  'NetworkEquipment'  : standardAssetStrategy,
  'Peripheral'        : standardAssetStrategy,
  'Rack'              : standardAssetStrategy,
  'Enclosure'         : standardAssetStrategy,
  'PDU'               : standardAssetStrategy,
  'PassiveDCEquipment': standardAssetStrategy,
  'Appliance'         : standardAssetStrategy,

  // Spéciaux
  'Software'         : softwareStrategy,
  'SoftwareLicense'  : softwareLicenseStrategy,
  'Cartridge'        : cartridgeStrategy,
  'Consumable'       : consumableStrategy,
  'Cable'            : cableStrategy,
  'Certificate'      : certificateStrategy,
}

// =========================================================
// FONCTION PRINCIPALE
// =========================================================

export async function createItemByType(row, statusMapping, logFn) {
  const log = logFn || (() => {})

  const dropdowns = await buildCommonDropdowns(row, statusMapping)

  const strategy = STRATEGIES[row.Item_Type]

  if (!strategy) {
    log('warning', `⚠️ Pas de stratégie pour "${row.Item_Type}", essai en format standard`)
    return await standardAssetStrategy(row, dropdowns, log)
  }

  return await strategy(row, dropdowns, log)
}

export function getSupportedTypes() {
  return Object.keys(STRATEGIES)
}