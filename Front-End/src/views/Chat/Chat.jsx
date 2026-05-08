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

const Chat = () => {
  const [chatHistory, setChatHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)

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

    try {
      const response = await services.modules.chat.sendMessage({
        prompt,
        files,
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
      console.error('Erro:', error)
      const errorMessage = {
        role: 'ia',
        content: 'Ocorreu um erro ao processar sua solicitação.',
      }
      setChatHistory((prev) => [...prev, errorMessage])
    } finally {
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
          <ChatMessages chatHistory={chatHistory} isLoading={isLoading} />
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
            />
          </FormProvider>
        </InputContainer>
      </Box>
    </MainContainer>
  )
}

export default Chat
