import { Box } from '@mui/material'
import styled from '@emotion/styled'

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

export default InputContainer
