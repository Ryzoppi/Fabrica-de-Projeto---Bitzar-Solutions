import { useRef, useState } from 'react'

import { Box, Grid } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import {
  AttachedItems,
  ChatMessages,
  InputContainer,
  MainBox,
  MainContainer,
  PromptField,
} from './components'

import services from 'services'

const incomingCharts = [
  // ... seu array de charts mockados
]

const Chat = () => {
  const [chatHistory, setChatHistory] = useState([{
    role: 'ia',
    content: incomingCharts,
    message: "",
    type: "charts",
  }])
  const [isLoading, setIsLoading] = useState(false)

  // Adicione isto para controlar o cancelamento
  const abortControllerRef = useRef(null)
  const fileInputRef = useRef(null)
  const formMethods = useForm({ defaultValues: { files: [], prompt: '' } })
  const { handleSubmit, reset } = formMethods

  const onAttachClick = () => fileInputRef.current.click()

  const onSubmit = async ({ prompt, files }) => {
    console.log('Enviando:', { prompt, files })

    if (!prompt.trim() && files.length === 0) return

    const userMessage = {
      role: 'user',
      content: prompt,
      attachments: files ?? [],
    }

    setChatHistory((prev) => [...prev, userMessage])
    reset({ files: [], prompt: '' })
    setIsLoading(true)

    // Crie um novo AbortController para esta requisição
    abortControllerRef.current = new AbortController()

    try {
      const response = await services.modules.chat.sendMessage({
        prompt,
        files,
        signal: abortControllerRef.current.signal, // Passe o signal
      })
      console.log('Resposta recebida:', response)

      const dataPath = response?.data?.data

      const iaMessage = {
        role: 'ia',
        content: dataPath?.charts?.data?.charts || dataPath?.charts || [],
        message: dataPath?.message,
        type: dataPath?.type,
      }
      setChatHistory((prev) => [...prev, iaMessage])
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Requisição cancelada pelo usuário')
        const cancelMessage = {
          role: 'ia',
          content: 'Criação de gráficos cancelada.',
        }
        setChatHistory((prev) => [...prev, cancelMessage])
      } else {
        console.error('Erro:', error)
        const errorMessage = {
          role: 'ia',
          content: 'Ocorreu um erro ao processar sua solicitação.',
        }
        setChatHistory((prev) => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }


  return (
    <MainContainer>
      <MainBox>
        <Grid
          container
          sx={{
            width: '100%',
            maxWidth: '80%',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <ChatMessages 
            chatHistory={chatHistory} 
            isLoading={isLoading}
            onCancel={handleCancel}
          />
        </Grid>
      </MainBox>

      <Box
        sx={{ p: 2, width: '100%', display: 'flex', justifyContent: 'center' }}
      >
        <InputContainer>
          <FormProvider {...formMethods}>
            <AttachedItems fileInputRef={fileInputRef} />
            <PromptField
              onAttachClick={onAttachClick}
              onSubmit={handleSubmit(onSubmit)}
              isLoading={isLoading}
            />
          </FormProvider>
        </InputContainer>
      </Box>
    </MainContainer>
  )
}

export default Chat