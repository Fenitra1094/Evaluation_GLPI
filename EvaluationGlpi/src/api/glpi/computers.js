import { glpiApi } from './core'
import { ensureSession } from './session'

export async function getComputers({
  start  = 0,
  limit  = 50,
  sort   = 'id',
  order  = 'ASC',
  search = '',
} = {}) {
  await ensureSession()

  const range = `${start}-${start + limit - 1}`

  const params = {
    expand_dropdowns: true,
    range,
    sort,
    order,
  }

  if (search) {
    params['searchText[name]'] = search
  }

  const response = await glpiApi.get('/Computer', { params })
  return response.data
}

export async function getComputerById(id) {
  await ensureSession()

  const response = await glpiApi.get(`/Computer/${id}`, {
    params: { expand_dropdowns: true },
  })
  return response.data
}