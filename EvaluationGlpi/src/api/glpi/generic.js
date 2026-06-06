import { glpiApi } from './core'
import { ensureSession } from './session'

export async function getAllItems(resource) {
  await ensureSession()

  try {
    const response = await glpiApi.get(`/${resource}`, {
      params: {
        range: '0-9999',
        only_id: true,
      },
    })
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    const status = error.response?.status
    if ([400, 401, 403, 404].includes(status)) {
      return []
    }
    throw error
  }
}
/**
 * Récupère un item par son ID
 */
export async function getItemById(resource, id) {
  await ensureSession()

  try {
    const response = await glpiApi.get(`/${resource}/${id}`)
    return response.data
  } catch (error) {
    console.error(`Erreur lecture ${resource}#${id}`, error)
    return null
  }
}

export async function countItems(resource) {
  const items = await getAllItems(resource)
  return items.length
}

export async function deleteItem(resource, id) {
  await ensureSession()
  return glpiApi.delete(`/${resource}/${id}`, {
    params: { force_purge: true },
  })
}

export async function purgeResource(resource, onProgress = null) {
  const items = await getAllItems(resource)
  const total = items.length

  let success = 0
  let failed  = 0

  for (let i = 0; i < items.length; i++) {
    try {
      await deleteItem(resource, items[i].id)
      success++
    } catch (err) {
      failed++
      console.error(`Erreur suppression ${resource}#${items[i].id}`, err)
    }

    if (onProgress) {
      onProgress({ resource, current: i + 1, total, success, failed })
    }
  }

  return { resource, total, success, failed }
}