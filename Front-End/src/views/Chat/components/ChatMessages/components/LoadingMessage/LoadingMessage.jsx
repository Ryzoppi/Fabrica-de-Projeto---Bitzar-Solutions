import { CloseRounded } from '@mui/icons-material'
import { Box, CircularProgress, IconButton, Typography } from '@mui/material'

const LoadingMessage = ({ iaStatus, onCancel }) => (
  <Box
    sx={{
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid #3F3F3F',
      borderRadius: '15px 15px 15px 0',
      p: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
    }}
  >
    <CircularProgress size={16} sx={{ color: '#aaaaaa' }} />
    <Typography variant="body2" sx={{ color: '#aaaaaa' }}>
      {iaStatus || 'Gerando gráficos...'}
    </Typography>
    <IconButton
      onClick={onCancel}
      size="small"
      sx={{
        color: '#ff6b6b',
        '&:hover': { backgroundColor: 'rgba(255, 107, 107, 0.1)' },
      }}
    >
      <CloseRounded fontSize="small" />
    </IconButton>
  </Box>
)

export default LoadingMessage
