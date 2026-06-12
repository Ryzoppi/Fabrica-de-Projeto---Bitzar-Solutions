import { Box, Typography } from '@mui/material'

import { ChartsBlock, ExplanationBlock } from '../../components'

const AiMessage = ({ msg }) => {
  const isCharts =
    msg.type === 'charts' &&
    Array.isArray(msg.content) &&
    msg.content.length > 0
  const hasText =
    !!msg.content && typeof msg.content === 'string' && msg.content.trim()

  if (!isCharts && !hasText) return null

  return (
    <Box
      sx={{
        alignSelf: 'flex-start',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 0.75,
        maxWidth: isCharts ? '100%' : '75%',
        width: isCharts ? '100%' : 'auto',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: '#fff',
          p: isCharts ? 1 : 2,
          borderRadius: '15px 15px 15px 0',
          border: '1px solid #3F3F3F',
          boxShadow: isCharts ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
          width: isCharts ? '100%' : 'auto',
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

      {isCharts && msg.explanation && (
        <ExplanationBlock explanation={msg.explanation} />
      )}
    </Box>
  )
}

export default AiMessage
