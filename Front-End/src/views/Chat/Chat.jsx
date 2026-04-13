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

// Mock: resposta da IA é um array de configs de gráficos
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

  const fileInputRef = useRef(null)
  const formMethods = useForm({ defaultValues: { files: [], prompt: '' } })
  const onAttachClick = () => fileInputRef.current.click()

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
          <ChatMessages chatHistory={chatHistory} />
        </Grid>
      </MainBox>

      <Box
        sx={{ p: 2, width: '100%', display: 'flex', justifyContent: 'center' }}
      >
        <InputContainer>
          <FormProvider {...formMethods}>
            <AttachedItems fileInputRef={fileInputRef} />
            <PromptField onAttachClick={onAttachClick} />
          </FormProvider>
        </InputContainer>
      </Box>
    </MainContainer>
  )
}

export default Chat
