import api from 'services/api'

const sendMessage = async ({ data }) =>
  await api.postForm('/processar', { data })

export default { sendMessage }
