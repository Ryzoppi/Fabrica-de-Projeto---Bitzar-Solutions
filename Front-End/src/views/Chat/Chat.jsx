import { useRef } from 'react'
import { Box, Grid } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { AttachedItems, PromptField } from './components'
import styled from '@emotion/styled'

const MainContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100%',
})

const InputContainer = styled(Box)({
  width: '100%',
  maxWidth: '80%',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '16px',
  border: '1px solid #3F3F3F',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  '&:focus-within': {
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
})

const Chat = () => {
  const fileInputRef = useRef(null)

  const formMethods = useForm({
    defaultValues: { files: [], prompt: '' },
  })

  const onAttachClick = () => fileInputRef.current.click()

  return (
    <MainContainer>
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Grid size={{ xs: 12, md: 8 }} sx={{ width: '100%', maxWidth: '80%' }}>
          <Box sx={{ color: '#fff' }}>Conteúdo do Chat</Box>
        </Grid>
      </Box>

      <Box
        sx={{
          p: 2,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
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
