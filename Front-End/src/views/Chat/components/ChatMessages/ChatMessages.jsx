import ReactMarkdown from 'react-markdown'
import { Box, CircularProgress, Typography } from '@mui/material'
import { AttachmentChip, ChartsBlock } from './components'

const ChatMessages = ({ chatHistory, isLoading }) => (
  <>
    {chatHistory.map((msg, index) => {
      const isUser = msg.role === 'user'
      const isCharts = msg.type === 'charts' && Array.isArray(msg.content)
      const hasAttachments =
        isUser && Array.isArray(msg.attachments) && msg.attachments.length > 0
      const textContent = isUser ? msg.content : msg.message

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

          {(textContent || !hasAttachments) && (
            <Box
              sx={{
                backgroundColor: isUser
                  ? '#2563eb'
                  : 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                p: isCharts ? 1 : 2,
                borderRadius: isUser ? '15px 15px 0 15px' : '15px 15px 15px 0',
                border: isUser ? 'none' : '1px solid #3F3F3F',
                boxShadow: isCharts ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {isCharts ? (
                <Box sx={{ minWidth: { xs: '280px', md: '500px' } }}>
                  <ChartsBlock charts={msg.content} />

                  {msg.explanation && (
                    <Box
                      sx={{
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: '1px solid #3F3F3F',
                        color: '#d1d5db',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        '& h1, & h2, & h3': {
                          color: '#f9fafb',
                          mt: 1.5,
                          mb: 0.5,
                          fontSize: '0.95rem',
                          fontWeight: 600,
                        },
                        '& ul, & ol': { pl: 2.5, mb: 1 },
                        '& li': { mb: 0.25 },
                        '& p': { mb: 0.75 },
                        '& strong': { color: '#f9fafb' },
                        '& code': {
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          borderRadius: '4px',
                          px: 0.5,
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                        },
                      }}
                    >
                      <ReactMarkdown>{msg.explanation}</ReactMarkdown>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {textContent}
                </Typography>
              )}
            </Box>
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
        }}
      >
        <CircularProgress size={16} sx={{ color: '#aaaaaa' }} />
      </Box>
    )}
  </>
)

export default ChatMessages
