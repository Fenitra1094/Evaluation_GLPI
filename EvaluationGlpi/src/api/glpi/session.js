import { glpiApi } from './core'

export async function initSession() {
  const userToken = import.meta.env.VITE_GLPI_USER_TOKEN

  const response = await glpiApi.get('/initSession', {
    headers: {
      Authorization: `user_token ${userToken}`,
    },
  })

  const token = response.data.session_token
  sessionStorage.setItem('glpi_session_token', token)
  return token
}

export async function killSession() {
  await glpiApi.get('/killSession')
  sessionStorage.removeItem('glpi_session_token')
}

export async function ensureSession() {
  const token = sessionStorage.getItem('glpi_session_token')
  if (!token) {
    await initSession()
  }
}