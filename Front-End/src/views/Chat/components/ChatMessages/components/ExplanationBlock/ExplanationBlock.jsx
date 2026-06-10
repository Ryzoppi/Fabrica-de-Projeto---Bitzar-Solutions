import { Box, Typography } from '@mui/material'
import ReactMarkdown from 'react-markdown'

const ExplanationBlock = ({ explanation }) => (
  <Box
    sx={{
      mt: 2,
      p: 2,
      bgcolor: '#111114',
      border: '0.5px solid #1e1e22',
      borderRadius: '10px',
    }}
  >
    <Typography
      sx={{
        fontSize: '0.65rem',
        fontWeight: 600,
        letterSpacing: '0.7px',
        textTransform: 'uppercase',
        color: '#0d9488',
        mb: 1.5,
      }}
    >
      Resumo dos dados
    </Typography>

    <Box
      sx={{
        color: '#a0a0a0',
        fontSize: '0.875rem',
        lineHeight: 1.6,
        '& h1, & h2, & h3': {
          color: '#f1f1f0',
          mt: 1.5,
          mb: 0.5,
          fontSize: '0.95rem',
          fontWeight: 600,
        },
        '& ul, & ol': { pl: 2.5, mb: 1 },
        '& li': { mb: 0.25 },
        '& p': { mb: 0.75 },
        '& strong': { color: '#f1f1f0' },
        '& code': {
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: '4px',
          px: 0.5,
          fontSize: '0.8rem',
          fontFamily: 'monospace',
        },
      }}
    >
      <ReactMarkdown>{explanation}</ReactMarkdown>
    </Box>
  </Box>
)

export default ExplanationBlock
