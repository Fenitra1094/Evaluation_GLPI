/**
 * Stats GLPI — 100% dynamique
 * Aucun type hardcodé, tout vient de l'API
 */

import { glpiApi } from './core'
import { ensureSession } from './session'
import { discoverResources } from './discovery'

// =========================================================
// CONFIGURATION
// =========================================================

const ALLOWED_CATEGORIES = ['Assets', 'Components']

const EXCLUDED_TYPES = new Set([
  'Global',
  'Schema',
])

// Palette de couleurs (rotation automatique)
const COLOR_PALETTE = [
  'purple', 'blue', 'orange', 'green', 'cyan',
  'pink',   'gray', 'yellow', 'indigo', 'red',
  'amber',  'lime', 'teal',   'rose',   'violet',
]

// =========================================================
// GÉNÉRATION AUTOMATIQUE D'ICÔNES
// =========================================================

/**
 * Détecte automatiquement l'icône selon le nom du type
 * via des mots-clés présents dans le nom (Computer, Printer, etc.)
 */
function detectIcon(typeKey) {
  const key = typeKey.toLowerCase()

  // Mappings par mots-clés (s'applique à tous les types contenant ces mots)
  const iconRules = [
    { keywords: ['computer', 'pc', 'desktop', 'laptop'], icon: '💻' },
    { keywords: ['monitor', 'screen', 'display'],        icon: '🖥️' },
    { keywords: ['printer', 'print'],                    icon: '🖨️' },
    { keywords: ['phone', 'mobile', 'tel'],              icon: '📞' },
    { keywords: ['network', 'switch', 'router'],         icon: '🌐' },
    { keywords: ['peripheral', 'keyboard', 'mouse'],     icon: '⌨️' },
    { keywords: ['rack', 'datacenter'],                  icon: '🗄️' },
    { keywords: ['pdu', 'power'],                        icon: '🔌' },
    { keywords: ['enclosure', 'case', 'chassis'],        icon: '📦' },
    { keywords: ['software', 'application'],             icon: '💿' },
    { keywords: ['license', 'licence'],                  icon: '🔑' },
    { keywords: ['cartridge', 'toner', 'ink'],           icon: '🖌️' },
    { keywords: ['consumable'],                          icon: '📋' },
    { keywords: ['cable', 'wire'],                       icon: '🔗' },
    { keywords: ['certificate', 'cert'],                 icon: '📜' },
    { keywords: ['battery'],                             icon: '🔋' },
    { keywords: ['camera'],                              icon: '📷' },
    { keywords: ['drive', 'harddisk', 'harddrive'],      icon: '💽' },
    { keywords: ['graphic'],                             icon: '🎮' },
    { keywords: ['memory', 'ram'],                       icon: '🧠' },
    { keywords: ['processor', 'cpu'],                    icon: '⚙️' },
    { keywords: ['sound', 'audio'],                      icon: '🔊' },
    { keywords: ['systemboard', 'motherboard'],          icon: '🖲️' },
    { keywords: ['simcard', 'sim'],                      icon: '📱' },
    { keywords: ['sensor'],                              icon: '🌡️' },
    { keywords: ['firmware'],                            icon: '🧬' },
    { keywords: ['controller'],                          icon: '🎛️' },
    { keywords: ['pci'],                                 icon: '🔧' },
    { keywords: ['appliance'],                           icon: '⚡' },
    { keywords: ['unmanaged'],                           icon: '❓' },
    { keywords: ['cluster'],                             icon: '☁️' },
    { keywords: ['database'],                            icon: '🗃️' },
    { keywords: ['contract'],                            icon: '📃' },
    { keywords: ['supplier'],                            icon: '🏢' },
    { keywords: ['contact'],                             icon: '👤' },
    { keywords: ['budget'],                              icon: '💵' },
    { keywords: ['project'],                             icon: '📊' },
    { keywords: ['document'],                            icon: '📄' },
    { keywords: ['domain'],                              icon: '🌍' },
    { keywords: ['line'],                                icon: '📞' },
  ]

  // Chercher une correspondance
  for (const rule of iconRules) {
    if (rule.keywords.some(kw => key.includes(kw))) {
      return rule.icon
    }
  }

  return '📦'  // Icône par défaut
}

/**
 * Génère une couleur basée sur un hash du nom
 * Le même type aura TOUJOURS la même couleur
 */
function getColorForType(typeKey) {
  let hash = 0
  for (let i = 0; i < typeKey.length; i++) {
    hash = ((hash << 5) - hash) + typeKey.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length
  return COLOR_PALETTE[index]
}

/**
 * Transforme un nom technique en label lisible
 * "NetworkEquipment" → "Network Equipment"
 * "SoftwareLicense"  → "Software License"
 */
function humanizeLabel(typeKey) {
  // Insère des espaces entre les majuscules
  return typeKey
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

// =========================================================
// HELPERS API
// =========================================================

async function countResource(resource) {
  await ensureSession()

  try {
    const response = await glpiApi.get(`/${resource}`, {
      params: { range: '0-0', only_id: true },
    })

    const contentRange = response.headers['content-range']
    if (contentRange) {
      const total = parseInt(contentRange.split('/')[1])
      return isNaN(total) ? 0 : total
    }

    const fullResponse = await glpiApi.get(`/${resource}`, {
      params: { range: '0-9999', only_id: true },
    })
    return Array.isArray(fullResponse.data) ? fullResponse.data.length : 0

  } catch (error) {
    return 0
  }
}

async function getAllItems(resource) {
  await ensureSession()

  try {
    const response = await glpiApi.get(`/${resource}`, {
      params: { range: '0-9999' },
    })
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    return []
  }
}

// =========================================================
// MAPPING TICKETS (entiers GLPI fixes, viennent de la doc API)
// =========================================================

export const TICKET_STATUS_LABELS = {
  1: { label: 'Nouveau',    color: 'blue',   icon: '🔵' },
  2: { label: 'En cours',   color: 'orange', icon: '🟠' },
  3: { label: 'Planifié',   color: 'purple', icon: '🟣' },
  4: { label: 'En attente', color: 'yellow', icon: '🟡' },
  5: { label: 'Résolu',     color: 'green',  icon: '🟢' },
  6: { label: 'Clos',       color: 'gray',   icon: '⚫' },
}

export const TICKET_TYPE_LABELS = {
  1: { label: 'Incident', color: 'red',  icon: '⚠️' },
  2: { label: 'Demande',  color: 'blue', icon: '📩' },
}

export const TICKET_PRIORITY_LABELS = {
  1: { label: 'Très basse', color: 'gray'   },
  2: { label: 'Basse',      color: 'blue'   },
  3: { label: 'Moyenne',    color: 'yellow' },
  4: { label: 'Haute',      color: 'orange' },
  5: { label: 'Très haute', color: 'red'    },
  6: { label: 'Majeure',    color: 'purple' },
}

// =========================================================
// STATS ASSETS — 100% DYNAMIQUE
// =========================================================

export async function getAssetsStats(onProgress = null) {
  if (onProgress) {
    onProgress({ current: 0, total: 1, label: 'Découverte des types GLPI...' })
  }

  // 1. Découvrir TOUS les types via l'API
  const discovered = await discoverResources()

  // 2. Filtrer
  const assetTypes = discovered.filter(r =>
    ALLOWED_CATEGORIES.includes(r.category) &&
    !EXCLUDED_TYPES.has(r.key)
  )

  // 3. Compter et enrichir chaque type
  const stats = []
  let total = 0

  for (let i = 0; i < assetTypes.length; i++) {
    const type = assetTypes[i]

    if (onProgress) {
      onProgress({
        current: i + 1,
        total  : assetTypes.length,
        label  : `Comptage ${type.key}...`
      })
    }

    const count = await countResource(type.key)
    total += count

    stats.push({
      key     : type.key,
      label   : humanizeLabel(type.key),    // Auto : "NetworkEquipment" → "Network Equipment"
      icon    : detectIcon(type.key),       // Auto : selon mots-clés
      color   : getColorForType(type.key),  // Auto : hash → couleur fixe
      category: type.category,
      count,
    })
  }

  return { stats, total }
}

// =========================================================
// STATS TICKETS
// =========================================================

export async function getTicketsStats() {
  const tickets = await getAllItems('Ticket')
  const total = tickets.length

  const byStatus = {}
  for (const id in TICKET_STATUS_LABELS) {
    byStatus[id] = { ...TICKET_STATUS_LABELS[id], count: 0 }
  }
  tickets.forEach(t => {
    if (byStatus[t.status]) byStatus[t.status].count++
  })

  const byType = {}
  for (const id in TICKET_TYPE_LABELS) {
    byType[id] = { ...TICKET_TYPE_LABELS[id], count: 0 }
  }
  tickets.forEach(t => {
    if (byType[t.type]) byType[t.type].count++
  })

  const byPriority = {}
  for (const id in TICKET_PRIORITY_LABELS) {
    byPriority[id] = { ...TICKET_PRIORITY_LABELS[id], count: 0 }
  }
  tickets.forEach(t => {
    if (byPriority[t.priority]) byPriority[t.priority].count++
  })

  return {
    total,
    byStatus  : Object.values(byStatus),
    byType    : Object.values(byType),
    byPriority: Object.values(byPriority),
    raw       : tickets,
  }
}