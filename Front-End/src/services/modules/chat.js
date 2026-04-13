import api from 'services/api'

const sendMessage = ({ prompt }) => api.post('/chat', { prompt })

export default { sendMessage }
