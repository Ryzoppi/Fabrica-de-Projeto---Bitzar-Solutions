import { useRef, useState } from 'react'

import { Box, Grid } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import axios from 'axios'

import {
  AttachedItems,
  ChatMessages,
  InputContainer,
  MainBox,
  MainContainer,
  PromptField,
  SuggestionChips,
  Topbar,
} from './components'

import services from 'services'

const getLastFileName = (chatHistory) => {
  for (let i = chatHistory.length - 1; i >= 0; i--) {
    const msg = chatHistory[i]
    if (msg.role === 'user' && msg.attachments?.length > 0) {
      return msg.attachments[msg.attachments.length - 1]?.name ?? null
    }
  }
  return null
}

const Chat = () => {
  const [chatHistory, setChatHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const abortControllerRef = useRef(null)
  const fileInputRef = useRef(null)
  const formMethods = useForm({ defaultValues: { files: [], prompt: '' } })
  const { handleSubmit, reset, setValue } = formMethods

  const onAttachClick = () => fileInputRef.current.click()

  const handleSuggestionSelect = (text) => setValue('prompt', text)

  const onSubmit = async ({ prompt, files }) => {
    if (!prompt.trim() && files.length === 0) return

    const history = chatHistory
      .filter((msg) => msg.role === 'user' || msg.role === 'ia')
      .slice(-10)
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

    abortControllerRef.current = new AbortController()

    try {
      const response = await services.modules.chat.sendMessage({
        prompt,
        files,
        history,
        signal: abortControllerRef.current.signal,
      })

      const dataPath = response?.data?.data
      const charts = dataPath?.charts ?? []

      const iaMessage = {
        role: 'ia',
        type: dataPath?.type,
        message: dataPath?.message,
        explanation: dataPath?.explanation ?? null,
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
      if (axios.isCancel(error)) {
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
    if (abortControllerRef.current) abortControllerRef.current.abort()
  }

  const isEmpty = chatHistory.length === 0
  const fileName = getLastFileName(chatHistory)

  return (
    <MainContainer>
      <Topbar fileName={fileName} />

      <MainBox>
        <Grid
          container
          sx={{
            width: '100%',
            maxWidth: '80%',
            flexDirection: 'column',
            gap: 2,
            flex: isEmpty ? 1 : 'unset',
          }}
        >
          {isEmpty ? (
            <Box sx={{ display: 'flex', flex: 1, width: '100%' }}>
              <SuggestionChips onSelect={handleSuggestionSelect} />
            </Box>
          ) : (
            <ChatMessages
              chatHistory={chatHistory}
              isLoading={isLoading}
              onCancel={handleCancel}
            />
          )}
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
