import * as session    from './glpi/session'
import * as computers  from './glpi/computers'
import * as generic    from './glpi/generic'
import * as discovery  from './glpi/discovery'
import * as importApi  from './glpi/import'

const GlpiClient = {
  // ───── SESSION ─────
  initSession   : session.initSession,
  killSession   : session.killSession,
  ensureSession : session.ensureSession,

  // ───── COMPUTERS ─────
  getComputers    : computers.getComputers,
  getComputerById : computers.getComputerById,

  // ───── GENERIC ─────
  getAllItems   : generic.getAllItems,
  countItems    : generic.countItems,
  deleteItem    : generic.deleteItem,
  purgeResource : generic.purgeResource,
  getItemById   : generic.getItemById, 
  getAllItemsWithDetails : generic.getAllItemsWithDetails, 

  // ───── DISCOVERY ─────
  discoverResources : discovery.discoverResources,

  // ───── IMPORT ─────
  findDropdownByName  : importApi.findDropdownByName,
  getOrCreateDropdown : importApi.getOrCreateDropdown,
  createItem          : importApi.createItem,
  updateItem          : importApi.updateItem,
}

export default GlpiClient