import axios from 'axios'

import { API_BASE_URL } from './env'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Remove o Content-Type padrão para FormData
api.interceptors.request.use((config) => {
  // Se for FormData, deixa o axios definir o Content-Type corretamente
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  } else {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token')
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })

export default api
