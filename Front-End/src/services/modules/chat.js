import api from 'services/api'

const sendMessage = async ({ prompt, files }) => {
  const formData = new FormData()
  formData.append('arquivo', files[0]) // primeiro arquivo
  formData.append('prompt', prompt)
  
  return await api.post('/processar', formData)
}

export default { sendMessage }