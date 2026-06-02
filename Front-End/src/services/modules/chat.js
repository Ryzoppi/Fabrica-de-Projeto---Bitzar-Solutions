import api from 'services/api'

const sendMessage = async ({ prompt, files, history = [] }) => {
  const formData = new FormData()

  files.forEach((file) => formData.append('arquivos', file))

  formData.append('prompt', prompt)

  formData.append('history', JSON.stringify(history))

  return await api.post('/processar', formData)
}

export default { sendMessage }
