import { Box, Chip, Typography } from '@mui/material'
import LogoMark from 'assets/favicon.svg?react'

const SUGGESTIONS = [
  'Vendas por mês em barras',
  'Comparar regiões em pizza',
  'Evolução de receita em linha',
  'Top 10 produtos por quantidade',
]

const SuggestionChips = ({ onSelect }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      flex: 1,
      width: '100%',
      px: 2,
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LogoMark width={40} height={40} />
        <Typography
          sx={{
            fontSize: '1.6rem',
            fontWeight: 700,
            color: '#f1f1f0',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          Dash<span style={{ color: '#2dd4bf' }}>ify</span>
        </Typography>
      </Box>

      <Typography
        sx={{
          fontSize: '1rem',
          color: '#888',
          textAlign: 'center',
          maxWidth: 360,
        }}
      >
        Envie uma planilha e descreva o que quer visualizar.
      </Typography>
    </Box>

    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        justifyContent: 'center',
      }}
    >
      {SUGGESTIONS.map((text) => (
        <Chip
          key={text}
          label={text}
          onClick={() => onSelect(text)}
          sx={{
            bgcolor: 'rgba(13,148,136,0.08)',
            color: '#a3a3a3',
            border: '0.5px solid rgba(13,148,136,0.25)',
            borderRadius: '20px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(13,148,136,0.15)',
              color: '#f1f1f0',
              borderColor: '#0d9488',
            },
          }}
        />
      ))}
    </Box>

    <Typography sx={{ fontSize: '0.7rem', color: '#333', textAlign: 'center' }}>
      Suporta .xlsx · .csv · .xls · Gráficos de barras, linhas, pizza e mais
    </Typography>
  </Box>
)

export default SuggestionChips
