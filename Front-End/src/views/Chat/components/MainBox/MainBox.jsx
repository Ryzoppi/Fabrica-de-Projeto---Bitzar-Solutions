import { Box } from '@mui/material'
import styled from '@emotion/styled'

const MainBox = styled(Box)({
  flexGrow: 1,
  overflowY: 'auto',
  p: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  // Estilização personalizada da barra de rolagem
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  },

  // Suporte para Firefox
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent',
})

export default MainBox
