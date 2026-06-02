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
    if (!prompt.trim() && files.length === 0) return

    const history = chatHistory
      .filter((msg) => msg.role === 'user' || msg.role === 'ia')
      .slice(-10) // Últimas 10 mensagens
      .map((msg) => ({
        role: msg.role === 'ia' ? 'assistant' : 'user',
        content:
          msg.role === 'ia' ? (msg.rawForHistory ?? '') : (msg.content ?? ''),
      }))
      .filter((msg) => msg.content !== '')

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
        history,
      })

      const dataPath = response?.data?.data
      const charts = dataPath?.charts ?? []

      const iaMessage = {
        role: 'ia',
        type: dataPath?.type,
        message: dataPath?.message,
        content: charts.map((chart) => ({
          ...chart,
          id: chart.id ?? crypto.randomUUID(),
          type: chart.type ?? chart.chartType,
        })),
        rawForHistory: JSON.stringify({
          charts: dataPath?.charts ?? [],
        }),
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
