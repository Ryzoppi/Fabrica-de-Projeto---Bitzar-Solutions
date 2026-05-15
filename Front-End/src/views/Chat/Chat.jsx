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
  {
    id: 'chart-1',
    title: 'Performance Jan–Abr',
    type: 'bar',
    options: {
      chart: {
        id: 'bar-1',
        background: 'transparent',
        theme: { mode: 'dark' },
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      tooltip: {
        theme: 'dark',
      },
      legend: {
        labels: {
          colors: '#aaaaaa',
        },
      },
      xaxis: {
        categories: ['Jan', 'Fev', 'Mar', 'Abr'],
        labels: {
          style: {
            colors: '#aaaaaa',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#aaaaaa',
          },
        },
      },
      colors: ['#00E39E'],
    },
    series: [{ name: 'Performance', data: [44, 55, 41, 67] }],
  },
  {
    id: 'chart-2',
    title: 'Receita mensal',
    type: 'line',
    options: {
      chart: {
        id: 'line-1',
        background: 'transparent',
        theme: { mode: 'dark' },
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      tooltip: {
        theme: 'dark',
      },
      legend: {
        labels: {
          colors: '#aaaaaa',
        },
      },
      xaxis: {
        categories: ['Jan', 'Fev', 'Mar', 'Abr'],
        labels: {
          style: {
            colors: '#aaaaaa',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#aaaaaa',
          },
        },
      },
      colors: ['#60A5FA'],
    },
    series: [{ name: 'Receita', data: [12000, 15000, 11000, 18000] }],
  },
]

const Chat = () => {
  const [chatHistory] = useState([
    { role: 'user', content: 'Olá, gere um gráfico de performance deste ano.' },
    { role: 'ia', content: 'Claro! Aqui estão os dados processados:' },
    { role: 'ia', content: incomingCharts, type: 'charts' },
    { role: 'ia', content: 'Espero que isso ajude na sua análise.' },
  ])
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
