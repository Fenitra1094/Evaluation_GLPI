import * as session    from './glpi/session'
import * as computers  from './glpi/computers'
import * as generic    from './glpi/generic'
import * as discovery  from './glpi/discovery'
import * as importApi  from './glpi/import'
import * as stats  from './glpi/stats'
import * as tickets from './glpi/tickets'
import * as items from './glpi/FrontOffice/items'

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

   // STATS
  getAssetsStats  : stats.getAssetsStats,
  getTicketsStats : stats.getTicketsStats,

    // TICKETS
  getTickets       : tickets.getTickets,
  getTicketById    : tickets.getTicketById,
  getTicketItems   : tickets.getTicketItems,
  getTicketCosts   : tickets.getTicketCosts,
  getItemDetails   : tickets.getItemDetails,
  createTicket       : tickets.createTicket,        // ← AJOUTÉ
  linkItemToTicket   : tickets.linkItemToTicket,    // ← AJOUTÉ
  createTicketCost   : tickets.createTicketCost, 
  updateTicketStatus   : tickets.updateTicketStatus,
  addTicketActor       : tickets.addTicketActor,
  createTicketSolution : tickets.createTicketSolution,
  addTicketFollowup    : tickets.addTicketFollowup,

   // ITEMS
  getItemsByType : items.getItemsByType,
  fetchAllTypesItems    : items.fetchAllTypesItems,
  fetchItemById    : items.fetchItemById,
}

export default GlpiClient