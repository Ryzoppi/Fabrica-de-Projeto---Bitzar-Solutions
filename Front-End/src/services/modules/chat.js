import api from 'services/api'

const sendMessage = ({ prompt, files, history = [], signal, onStatus }) =>
  new Promise((resolve, reject) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('arquivos', file))
    formData.append('prompt', prompt)
    formData.append('history', JSON.stringify(history))

    fetch(`${api.defaults.baseURL}/processar`, {
      method: 'POST',
      body: formData,
      signal,
    })
      .then((res) => {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        const read = () => {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) return

              const lines = decoder.decode(value).split('\n\n').filter(Boolean)

              lines.forEach((line) => {
                if (!line.startsWith('data: ')) return
                try {
                  const json = JSON.parse(line.replace('data: ', ''))

                  if (json.type === 'status') onStatus?.(json.message)
                  if (json.type === 'done') resolve(json.data.data)
                  if (json.type === 'error') reject(new Error(json.message))
                } catch (e) {
                  console.error('Erro ao parsear SSE:', e)
                }
              })

              read()
            })
            .catch(reject)
        }

        read()
      })
      .catch(reject)
  })

export default { sendMessage }
