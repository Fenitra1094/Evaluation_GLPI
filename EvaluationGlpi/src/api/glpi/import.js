import { glpiApi } from './core'
import { ensureSession } from './session'

// =========================================================
// HELPER : Extraire le message d'erreur GLPI
// =========================================================
function extractGlpiError(error) {
  const status = error.response?.status
  const data   = error.response?.data

  // GLPI renvoie souvent : ["ERROR_CODE", "message lisible"]
  if (Array.isArray(data) && data.length >= 2) {
    return {
      status,
      code   : data[0],
      message: data[1],
      raw    : data,
    }
  }

  // Sinon, autre format
  return {
    status,
    code   : 'UNKNOWN',
    message: error.message,
    raw    : data,
  }
}

// =========================================================
// DROPDOWNS
// =========================================================

    export async function findDropdownByName(resource, name) {
        await ensureSession()

        try {
            const response = await glpiApi.get(`/${resource}`, {
            params: {
                'searchText[name]': name,
                range: '0-100',
            },
            })

            const items = Array.isArray(response.data) ? response.data : []
            const found = items.find(i => i.name === name)
            return found ? found.id : null

        } catch (error) {
            return null
        }
        }
        export async function getOrCreateDropdown(resource, name, extraFields = {}) {
        // ✅ Si vide → 0 au lieu de null
        if (!name || name.trim() === '') return 0

        const existingId = await findDropdownByName(resource, name)
        if (existingId) {
            console.log(`  ↳ [${resource}] "${name}" déjà existant (id=${existingId})`)
            return existingId
        }

        await ensureSession()

        try {
            console.log(`  ↳ [${resource}] Création de "${name}"...`)
            const response = await glpiApi.post(`/${resource}`, {
            input: { name, ...extraFields }
            })

            const created = Array.isArray(response.data) ? response.data[0] : response.data
            console.log(`  ↳ [${resource}] ✅ Créé (id=${created.id})`)
            return created.id

        } catch (error) {
            const err = extractGlpiError(error)
            console.error(`  ↳ [${resource}] ❌ Erreur création "${name}" :`, err)
            throw new Error(
            `Impossible de créer "${name}" dans ${resource} : ${err.code} - ${err.message}`
            )
        }
    }

// =========================================================
// CRÉATION D'ITEMS
// =========================================================

export async function createItem(resource, data) {
  await ensureSession()

  try {
    console.log(`📦 [${resource}] Création avec :`, data)
    const response = await glpiApi.post(`/${resource}`, {
      input: data
    })

    const created = Array.isArray(response.data) ? response.data[0] : response.data
    console.log(`📦 [${resource}] ✅ Créé (id=${created.id})`)
    return created.id

  } catch (error) {
    const err = extractGlpiError(error)
    console.error(`📦 [${resource}] ❌ Erreur création :`, err)
    console.error(`📦 [${resource}] Données envoyées :`, data)

    // Re-throw avec message clair
    throw new Error(
      `${resource} : ${err.code} - ${err.message}`
    )
  }
}

export async function updateItem(resource, id, data) {
  await ensureSession()

  try {
    const response = await glpiApi.put(`/${resource}/${id}`, {
      input: data
    })
    return response.data
  } catch (error) {
    const err = extractGlpiError(error)
    throw new Error(`Update ${resource}#${id} : ${err.code} - ${err.message}`)
  }
}