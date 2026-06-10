import { Modal, Paper, Typography, Box } from '@mui/material'

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
          width: 400,
          p: 3,
          bgcolor: '#1E1E1E',
          color: '#fff',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Alterar cores
        </Typography>

        {labels.map((label, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
              bgcolor:
                index === selectedBar ? 'rgba(37,99,235,0.15)' : 'transparent',
              borderRadius: 1,
              border:
                index === selectedBar
                  ? '1px solid #2563eb'
                  : '1px solid transparent',
            }}
          >
            <Typography>{label}</Typography>

            <input
              type="color"
              value={chart.options?.colors?.[index] ?? '#2563eb'}
              onChange={(e) => onColorChange(chart.id, index, e.target.value)}
            />
          </Box>
        ))}
      </Paper>
    </Modal>
  )
}

export default ChartColorsModal
