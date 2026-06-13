 DOC_12_import_modifications.md
Markdown

# 📦 Import CSV : Guide des modifications

> ⚡ Comment modifier le système d'import sans tout casser.

---

## 🏗️ ARCHITECTURE DE L'IMPORT
Fichiers CSV/ZIP
│
▼
┌─────────────────────┐
│ globalImportStore.js │ ← Orchestre tout
├─────────────────────┤
│ Phase 1 : Assets │ → itemStrategies.js
│ Phase 2 : Tickets │ → ticketStrategies.js
│ Phase 3 : Coûts │ → costStrategies.js
│ Phase 4 : Images │ → imageStrategies.js
└─────────────────────┘
│
▼
API GLPI (POST)
│
▼
Si erreur → ROLLBACK tout

text


---

## 🎯 MÉMO FICHIERS

| Fichier | Rôle | Modifier si... |
|---------|------|----------------|
| `globalImportStore.js` | Orchestre les 4 phases | Ajouter/retirer une phase |
| `utils/itemStrategies.js` | Crée les assets | Ajouter colonne asset |
| `utils/ticketStrategies.js` | Crée les tickets + liens | Ajouter colonne ticket |
| `utils/costStrategies.js` | Crée les coûts | Ajouter colonne coût |
| `utils/imageStrategies.js` | Upload images depuis ZIP | Modifier logique images |
| `utils/csvParser.js` | Parse le CSV | Changer séparateur/encodage |
| `GlobalImportView.vue` | Interface utilisateur | Ajouter checkbox/options |

---

## 📋 CAS 1 : Ajouter une colonne dans le CSV Assets

### Exemple : ajouter "Commentaire"

#### Étape 1 : CSV
```csv
Name,Item_Type,Inventory_Number,Commentaire
PC-001,Computer,INV-001,Ordinateur bureau Jean
Étape 2 : itemStrategies.js
JavaScript

export async function createItemByType(row, statusMapping, addLog) {

  const payload = {
    name        : row.Name,
    otherserial : row.Inventory_Number,
    // ⭐ AJOUTER ICI
    comment     : row.Commentaire || '',
  }

  // ... reste du code
}
Étape 3 : (Optionnel) Validation dans globalImportStore.js
JavaScript

// Si le champ est OBLIGATOIRE, ajouter dans la validation
const ASSETS_REQUIRED = ['Name', 'Item_Type', 'Inventory_Number']
// Devient :
const ASSETS_REQUIRED = ['Name', 'Item_Type', 'Inventory_Number', 'Commentaire']

// Si le champ est OPTIONNEL, ne rien changer
✅ C'est tout ! Le CSV parser lit automatiquement les colonnes.
📋 CAS 2 : Ajouter une colonne dans le CSV Tickets
Exemple : ajouter "Catégorie"
Étape 1 : CSV
csv

Ref_Ticket,Titre,Type,Categorie
T001,Panne PC,Incident,Hardware
Étape 2 : ticketStrategies.js
JavaScript

export async function createTicket(row, addLog) {

  const ticketData = {
    name     : row.Titre,
    content  : row.Description || row.Titre,
    type     : mapType(row.Type),
    status   : 1,
    // ⭐ AJOUTER ICI
    itilcategories_id : await findCategoryId(row.Categorie),
  }

  // ... reste du code
}

// ⭐ AJOUTER cette fonction helper
async function findCategoryId(categoryName) {
  if (!categoryName) return 0

  try {
    const response = await glpiApi.get('/ITILCategory', {
      params: {
        searchText: { name: categoryName },
        range: '0-1'
      }
    })
    return response.data?.[0]?.id || 0
  } catch {
    return 0
  }
}
📋 CAS 3 : Gérer les doublons sans erreur
Problème
Le CSV contient un item qui existe déjà dans GLPI → erreur 400.

Solution : Vérifier avant de créer
JavaScript

// Dans itemStrategies.js

export async function createItemByType(row, statusMapping, addLog) {

  const itemtype = row.Item_Type   // "Computer"
  const invNum   = row.Inventory_Number

  // ⭐ VÉRIFIER si l'item existe déjà
  const existing = await findExistingItem(itemtype, invNum)

  if (existing) {
    addLog('warning', `⚠️ ${row.Name} existe déjà (id=${existing.id}), ignoré`)

    // Option A : Ignorer (passer au suivant)
    return existing.id

    // Option B : Mettre à jour au lieu de créer
    // return await updateExistingItem(existing.id, itemtype, row)
  }

  // Créer normalement si n'existe pas
  const payload = { ... }
  const response = await glpiApi.post(`/${itemtype}`, { input: payload })
  return response.data.id
}

// ⭐ Fonction de recherche
async function findExistingItem(itemtype, inventoryNumber) {
  try {
    const response = await glpiApi.get(`/${itemtype}`, {
      params: {
        searchText: { otherserial: inventoryNumber },
        range: '0-1'
      }
    })
    const items = Array.isArray(response.data) ? response.data : []
    return items.length > 0 ? items[0] : null
  } catch {
    return null
  }
}
💡 3 stratégies pour les doublons
Stratégie	Code	Quand
Ignorer	return existing.id	Le doublon est OK
Mettre à jour	await update(...)	Écraser les anciennes valeurs
Erreur	throw new Error(...)	Le doublon est interdit
📋 CAS 4 : Checkbox "Importer les images ou pas"
Étape 1 : Ajouter le state dans le store
📂 globalImportStore.js

JavaScript

// ⭐ AJOUTER dans les options
const options = ref({
  importImages    : true,    // Importer les images ?
  skipDuplicates  : true,    // Ignorer les doublons ?
  updateExisting  : false,   // Mettre à jour si existe ?
})
Étape 2 : Utiliser dans importAll()
JavaScript

async function importAll() {
  // ... phases 1, 2, 3

  // ⭐ Phase 4 : Images (seulement si coché)
  if (imagesFile.value && options.value.importImages) {
    addLog('info', `🖼️ PHASE 4 : Images...`)
    // ... code images
  } else if (imagesFile.value && !options.value.importImages) {
    addLog('info', `🖼️ PHASE 4 : Images ignorées (option décochée)`)
  }
}
Étape 3 : Ajouter la checkbox dans la vue
📂 GlobalImportView.vue

vue

<!-- SECTION OPTIONS (avant le bouton "Importer") -->
<section class="options-card">
  <h3>⚙️ Options d'import</h3>

  <label class="checkbox">
    <input type="checkbox" v-model="store.options.importImages" />
    <span>🖼️ Importer les images depuis le ZIP</span>
  </label>

  <label class="checkbox">
    <input type="checkbox" v-model="store.options.skipDuplicates" />
    <span>⏭️ Ignorer les doublons (au lieu d'erreur)</span>
  </label>

  <label class="checkbox">
    <input type="checkbox" v-model="store.options.updateExisting" />
    <span>🔄 Mettre à jour les éléments existants</span>
  </label>
</section>

<style>
.checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}
.checkbox input { cursor: pointer; }
</style>
Étape 4 : Exporter les options
JavaScript

// Dans globalImportStore.js
return {
  // ... existant
  options,    // ⭐ AJOUTER
}
📋 CAS 5 : Ajouter une colonne dans le CSV Coûts
Exemple : ajouter "Budget"
CSV
csv

Num_Ticket,Nom_Cout,Cout_Fixe,Budget
T001,Réparation,150,Budget IT 2024
costStrategies.js
JavaScript

export async function createTicketCost(row, ticketsMap, addLog) {

  const costData = {
    tickets_id    : ticketId,
    name          : row.Nom_Cout || 'Coût',
    cost_fixed    : Number(row.Cout_Fixe) || 0,
    // ⭐ AJOUTER ICI
    budgets_id    : await findBudgetId(row.Budget),
  }

  // ... reste du code
}

async function findBudgetId(budgetName) {
  if (!budgetName) return 0
  try {
    const response = await glpiApi.get('/Budget', {
      params: { searchText: { name: budgetName }, range: '0-1' }
    })
    return response.data?.[0]?.id || 0
  } catch { return 0 }
}
📋 CAS 6 : Lier un Item_Ticket sans erreur
Problème actuel
text

POST /Item_Ticket 400 : "Vous n'avez pas les droits"
Causes et solutions
Cause	Solution
Ticket clos (status 6)	Créer en status 1, lier, puis changer
Item inexistant	Vérifier avant de lier
Doublon Item_Ticket	Vérifier si déjà lié
Code robuste
JavaScript

// Dans ticketStrategies.js

async function linkItemToTicket(ticketId, itemtype, itemId, addLog) {

  // ⭐ 1. Vérifier que l'item existe
  try {
    await glpiApi.get(`/${itemtype}/${itemId}`)
  } catch {
    addLog('warning', `⚠️ ${itemtype}#${itemId} n'existe pas, lien ignoré`)
    return null
  }

  // ⭐ 2. Vérifier si déjà lié
  try {
    const existing = await glpiApi.get(`/Ticket/${ticketId}/Item_Ticket`, {
      params: { range: '0-999' }
    })
    const links = Array.isArray(existing.data) ? existing.data : []
    const alreadyLinked = links.find(
      l => l.itemtype === itemtype && l.items_id === itemId
    )
    if (alreadyLinked) {
      addLog('warning', `⚠️ ${itemtype}#${itemId} déjà lié au ticket #${ticketId}`)
      return alreadyLinked.id
    }
  } catch {
    // pas grave, on continue
  }

  // ⭐ 3. Créer le lien
  try {
    const response = await glpiApi.post('/Item_Ticket', {
      input: {
        tickets_id: ticketId,
        items_id: itemId,
        itemtype: itemtype,
      }
    })
    const result = Array.isArray(response.data) ? response.data[0] : response.data
    addLog('success', `✅ ${itemtype}#${itemId} lié au ticket #${ticketId}`)
    return result.id
  } catch (err) {
    addLog('error', `❌ Impossible de lier ${itemtype}#${itemId} : ${err.message}`)
    return null
  }
}
📋 CAS 7 : Créer le ticket en status 1 PUIS changer
Problème
Créer un ticket directement en status 6 (clos) empêche d'y ajouter des items.

Solution : workflow en 3 temps
JavaScript

export async function createTicketWithItems(row, addLog) {

  const finalStatus = mapStatus(row.Statut)  // ex: 6

  // ⭐ TEMPS 1 : Créer en status NOUVEAU
  const ticketId = await createTicketInGlpi({
    name    : row.Titre,
    content : row.Description,
    type    : mapType(row.Type),
    status  : 1,   // ← TOUJOURS 1 ici !
  })

  addLog('success', `✅ Ticket #${ticketId} créé (status=1)`)

  // ⭐ TEMPS 2 : Lier les items (possible car status=1)
  const linkedItems = []
  if (row.Items_Lies) {
    const items = parseItems(row.Items_Lies)
    for (const item of items) {
      const linkId = await linkItemToTicket(ticketId, item.type, item.id, addLog)
      if (linkId) linkedItems.push({ ...item, linkId })
    }
  }

  // ⭐ TEMPS 3 : Changer au status final
  if (finalStatus !== 1) {
    try {
      await glpiApi.put(`/Ticket/${ticketId}`, {
        input: { id: ticketId, status: finalStatus }
      })
      addLog('success', `🔄 Ticket #${ticketId} → status ${finalStatus}`)
    } catch (err) {
      addLog('warning', `⚠️ Impossible de changer le status : ${err.message}`)
    }
  }

  return { ticketId, linkedItems }
}
📋 CAS 8 : Stocker l'image seulement si coché
Store
JavaScript

const options = ref({
  importImages     : true,     // Importer les images ?
  linkImagesToAsset: true,     // Lier l'image à l'asset ?
  keepOrphanImages : false,    // Garder les images sans asset ?
})
imageStrategies.js
JavaScript

export async function uploadImageForAsset(img, addLog, options) {

  // ⭐ Vérifier si l'import est activé
  if (!options.importImages) {
    addLog('info', `🖼️ Image ignorée (option désactivée)`)
    return null
  }

  // Upload le document
  const docId = await uploadDocument(img)

  // ⭐ Lier seulement si coché
  if (options.linkImagesToAsset) {
    const asset = findAssetByImageName(img.filename)
    if (asset) {
      const linkId = await linkDocumentToItem(docId, asset.type, asset.id)
      return { documentId: docId, linkId, assetName: asset.name }
    } else if (!options.keepOrphanImages) {
      // Supprimer l'image orpheline
      await deleteDocument(docId)
      addLog('warning', `🗑️ Image sans asset supprimée : ${img.filename}`)
      return null
    }
  }

  return { documentId: docId, linkId: null, assetName: null }
}
Vue : checkboxes
vue

<label class="checkbox">
  <input type="checkbox" v-model="store.options.importImages" />
  <span>🖼️ Importer les images</span>
</label>

<label class="checkbox" v-if="store.options.importImages">
  <input type="checkbox" v-model="store.options.linkImagesToAsset" />
  <span>🔗 Lier les images aux assets</span>
</label>

<label class="checkbox" v-if="store.options.importImages">
  <input type="checkbox" v-model="store.options.keepOrphanImages" />
  <span>📎 Garder les images sans asset correspondant</span>
</label>
🎯 MÉMO DES MODIFICATIONS RAPIDES
Ajouter une colonne CSV
text

1. Ajouter la colonne dans le CSV
2. Lire la valeur : row.NomColonne
3. Ajouter dans le payload : champGlpi: row.NomColonne
4. (Optionnel) Validation : ASSETS_REQUIRED.push('NomColonne')
Ajouter une option (checkbox)
text

1. Store : options.ref({ maOption: true })
2. Vue : <input type="checkbox" v-model="store.options.maOption" />
3. Code : if (store.options.maOption) { ... }
4. Export : return { options }
Gérer les doublons
text

1. Chercher : findExisting(type, serial)
2. Si trouvé + ignorer : return existing.id
3. Si trouvé + update : await update(existing.id, data)
4. Si pas trouvé : await create(data)
Lier Item_Ticket sans erreur
text

1. Créer ticket en status 1
2. Lier les items
3. Changer le status au final
