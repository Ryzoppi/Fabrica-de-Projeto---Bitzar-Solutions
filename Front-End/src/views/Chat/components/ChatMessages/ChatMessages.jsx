import { Box, CircularProgress, Typography, IconButton } from '@mui/material'
import { CloseRounded } from '@mui/icons-material'

import { AttachmentChip, ChartsBlock, ExplanationBlock } from './components'

const ChatMessages = ({ chatHistory, isLoading, onCancel }) => (
  <>
    {chatHistory.map((msg, index) => {
      const isUser = msg.role === 'user'
      const isCharts = msg.type === 'charts' && Array.isArray(msg.content)
      const hasAttachments =
        isUser && Array.isArray(msg.attachments) && msg.attachments.length > 0

      return (
        <Box
          key={index}
          sx={{
            alignSelf: isUser ? 'flex-end' : 'flex-start',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isUser ? 'flex-end' : 'flex-start',
            gap: 0.75,
            maxWidth: isCharts ? '100%' : '75%',
            width: isCharts ? '100%' : 'auto',
          }}
        >
          {hasAttachments && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.75,
                justifyContent: 'flex-end',
              }}
            >
              {msg.attachments.map((file, i) => (
                <AttachmentChip key={i} file={file} />
              ))}
            </Box>
          )}

          {(msg.content || !hasAttachments) && (
            <Box
              sx={{
                backgroundColor: isUser
                  ? '#0d9488'
                  : 'rgba(255, 255, 255, 0.05)',
                color: isUser ? '#f0fdfb' : '#fff',
                p: isCharts ? 1 : 2,
                borderRadius: isUser ? '15px 15px 0 15px' : '15px 15px 15px 0',
                border: isUser ? 'none' : '1px solid #3F3F3F',
                boxShadow: isCharts ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {isCharts ? (
                <Box sx={{ minWidth: { xs: '280px', md: '500px' } }}>
                  <ChartsBlock charts={msg.content} />
                </Box>
              ) : (
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Typography>
              )}
            </Box>
          )}

          {/* Explanation fora do card de gráficos */}
          {isCharts && msg.explanation && (
            <ExplanationBlock explanation={msg.explanation} />
          )}
        </Box>
      )
    })}

    {isLoading && (
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
          Gerando gráficos...
        </Typography>
        <IconButton
          onClick={onCancel}
          size="small"
          sx={{
            color: '#ff6b6b',
            '&:hover': {
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
            },
          }}
        >
          <CloseRounded fontSize="small" />
        </IconButton>
      </Box>
    )}
  </>
)

export default ChatMessages
