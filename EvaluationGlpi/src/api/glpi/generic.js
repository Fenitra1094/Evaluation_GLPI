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
/**
 * Supprime TOUS les éléments d'une ressource
 * 🚀 OPTIMISÉ avec parallélisme par batch
 */
export async function purgeResource(resource, onProgress = null) {
  const items = await getAllItems(resource)
  const total = items.length

  if (total === 0) {
    return { resource, total: 0, success: 0, failed: 0 }
  }

  let success = 0
  let failed  = 0

  // 🚀 PARALLÉLISME : 10 DELETE en même temps
  const BATCH_SIZE = 10

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE)

    // ✅ Lance les 10 DELETE en parallèle
    const results = await Promise.allSettled(
      batch.map(item => deleteItem(resource, item.id))
    )

    // Compter les résultats
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        success++
      } else {
        failed++
        console.error(`Erreur suppression ${resource}`, result.reason?.message)
      }
    })

    // Notifier la progression
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