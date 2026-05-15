import axios from 'axios'

import { API_BASE_URL } from './env'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

 api.interceptors.request.use((config) => {
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
