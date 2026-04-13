import { Box, Typography } from '@mui/material'

import { ChartsBlock } from './components'

const ChatMessages = ({ chatHistory }) => {
  return (
    <>
      {chatHistory.map((msg, index) => {
        const isUser = msg.role === 'user'
        const isCharts = msg.type === 'charts' && Array.isArray(msg.content)

        return (
          <Box
            key={index}
            sx={{
              alignSelf: isUser ? 'flex-end' : 'flex-start',
              backgroundColor: isUser ? '#2563eb' : 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              p: isCharts ? 1 : 2,
              borderRadius: isUser ? '15px 15px 0 15px' : '15px 15px 15px 0',
              maxWidth: isCharts ? '100%' : '75%',
              width: isCharts ? '100%' : 'auto',
              border: isUser ? 'none' : '1px solid #3F3F3F',
              boxShadow: isCharts ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {isCharts ? (
              <Box sx={{ minWidth: { xs: '280px', md: '500px' } }}>
                <ChartsBlock charts={msg.content} />
              </Box>
            ) : (
              <Typography variant="body1">{msg.content}</Typography>
            )}
          </Box>
        )
      })}
    </>
  )
}

export default ChatMessages
