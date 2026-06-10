import { glpiApi } from './core'
import { ensureSession } from './session'

export async function getAllItems(resource, includeDeleted = false) {
  await ensureSession()

  try {
    const response = await glpiApi.get(`/${resource}`, {
      params: {
        range: '0-9999',
        only_id: true,
        ...(includeDeleted && { is_deleted: true }),
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
  const [active, deleted] = await Promise.all([
    getAllItems(resource, false),
    getAllItems(resource, true),
  ])
  return active.length + deleted.length
}

/**
 * Récupère tous les items AVEC leurs détails (pas juste les IDs)
 */
export async function getAllItemsWithDetails(resource) {
  await ensureSession()

  try {
    const response = await glpiApi.get(`/${resource}`, {
      params: {
        range: '0-9999',
        // PAS de only_id : true !
        // On veut tout
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

export async function deleteItem(resource, id) {
  await ensureSession()
  return glpiApi.delete(`/${resource}/${id}`, {
    params: { force_purge: true },
  })
}

// =========================================================
// purgeResource : récupère ACTIFS + CORBEILLE
// =========================================================
export async function purgeResource(resource, onProgress = null) {
  // 1. Récupérer les actifs ET la corbeille
  const [active, deleted] = await Promise.all([
    getAllItems(resource, false),
    getAllItems(resource, true),
  ])

  // 2. Combiner sans doublons
  const allIds = new Set([
    ...active.map(i => i.id),
    ...deleted.map(i => i.id),
  ])

  const items = Array.from(allIds).map(id => ({ id }))
  const total = items.length

  console.log(`🗑️ purgeResource(${resource}) : ${active.length} actifs + ${deleted.length} corbeille = ${total} total`)

  if (total === 0) {
    return { resource, total: 0, success: 0, failed: 0 }
  }

  let success = 0
  let failed  = 0
  const BATCH_SIZE = 10

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE)

    const results = await Promise.allSettled(
      batch.map(item => deleteItem(resource, item.id))
    )

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        success++
      } else {
        failed++
        console.error(`Erreur suppression ${resource}`, result.reason?.message)
      }
    })

    if (onProgress) {
      onProgress({
        resource,
        current: Math.min(i + BATCH_SIZE, total),
        total,
        success,
        failed,
      })
    }
  }

  return { resource, total, success, failed }
}