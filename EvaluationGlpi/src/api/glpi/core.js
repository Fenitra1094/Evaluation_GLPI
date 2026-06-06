import axios from 'axios'

export const glpiApi = axios.create({
  baseURL: import.meta.env.VITE_GLPI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'App-Token': import.meta.env.VITE_GLPI_APP_TOKEN,
  },
})

glpiApi.interceptors.request.use((config) => {
  const sessionToken = sessionStorage.getItem('glpi_session_token')
  if (sessionToken) {
    config.headers['Session-Token'] = sessionToken
  }
  return config
})