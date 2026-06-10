import { Modal, Paper, Typography, Box } from '@mui/material'

import { ColorSwatch } from 'components'

const ChartColorsModal = ({
  open,
  onClose,
  chart,
  onColorChange,
  selectedBar,
}) => {
  const labels = chart.categories ?? chart.options?.labels ?? []

  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 360,
          p: 3,
          bgcolor: '#111114',
          border: '0.5px solid #242428',
          borderRadius: 2,
          outline: 'none',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2.5,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: '#f1f1f0' }}
          >
            Alterar cores
          </Typography>
          <Box
            component="button"
            onClick={onClose}
            sx={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1a1a1e',
              border: '0.5px solid #2a2a2e',
              borderRadius: '6px',
              color: '#888',
              cursor: 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
              '&:hover': { color: '#f1f1f0', borderColor: '#3a3a3e' },
            }}
          >
            ✕
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {labels.map((label, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 1.5,
                py: 1,
                borderRadius: '6px',
                bgcolor:
                  index === selectedBar
                    ? 'rgba(13,148,136,0.07)'
                    : 'transparent',
                border:
                  index === selectedBar
                    ? '1px solid #0d9488'
                    : '1px solid transparent',
              }}
            >
              <Typography sx={{ fontSize: '0.85rem', color: '#c0c0c0' }}>
                {label}
              </Typography>

              <ColorSwatch
                color={chart.options?.colors?.[index] ?? '#0d9488'}
                onChange={(newColor) =>
                  onColorChange(chart.id, index, newColor)
                }
              />
            </Box>
          ))}
        </Box>
      </Paper>
    </Modal>
  )
}

export default ChartColorsModal
