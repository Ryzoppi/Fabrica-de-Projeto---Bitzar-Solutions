import { useState } from 'react'

import {
  Box,
  Typography,
  Modal,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Button,
} from '@mui/material'
import {
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  AreaChart as AreaChartIcon,
  PieChart as PieChartIcon,
  DonutLarge as DonutLargeIcon,
} from '@mui/icons-material'

import { ColorSwatch } from 'components'

const CHART_TYPES = [
  { value: 'bar', label: 'Barras', Icon: BarChartIcon },
  { value: 'line', label: 'Linha', Icon: ShowChartIcon },
  { value: 'area', label: 'Área', Icon: AreaChartIcon },
  { value: 'pie', label: 'Pizza', Icon: PieChartIcon },
  { value: 'donut', label: 'Donut', Icon: DonutLargeIcon },
]

const ChartConfigModal = ({
  open,
  onClose,
  chart,
  allCharts,
  onApply,
  onColorChange,
}) => {
  const [selectedType, setSelectedType] = useState(chart.type)

  const handleApply = () => {
    onApply({
      chartId: chart.id,
      newType: selectedType,
      newOrder: allCharts.map((c) => c.id),
    })
    onClose()
  }

  const getColorTargets = () => {
    const type = chart.type

    if (['pie', 'donut'].includes(type)) {
      return (chart.options?.labels ?? chart.categories ?? []).map(
        (label, index) => ({
          label,
          index,
        }),
      )
    }

    if (type === 'bar') {
      return (chart.categories ?? chart.options?.xaxis?.categories ?? []).map(
        (label, index) => ({
          label,
          index,
        }),
      )
    }

    return (Array.isArray(chart.series) ? chart.series : []).map(
      (s, index) => ({
        label: s.name ?? `Série ${index + 1}`,
        index,
      }),
    )
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90vw', sm: 420 },
          bgcolor: '#111114',
          border: '0.5px solid #242428',
          borderRadius: 2,
          p: 3,
          outline: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: '#f1f1f0' }}
          >
            Configurar gráfico
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

        <Typography
          sx={{
            mb: 1.5,
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.7px',
            textTransform: 'uppercase',
            color: '#333',
          }}
        >
          Tipo de gráfico
        </Typography>

        <ToggleButtonGroup
          value={selectedType}
          exclusive
          onChange={(_, val) => val && setSelectedType(val)}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 1,
          }}
        >
          {CHART_TYPES.map(({ value, label, Icon }) => (
            <ToggleButton
              key={value}
              value={value}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.75,
                py: 1.5,
                color: '#888',
                border: '0.5px solid #2a2a2e !important',
                borderRadius: '8px !important',
                '&.Mui-selected': {
                  bgcolor: 'rgba(13,148,136,0.1)',
                  color: '#2dd4bf',
                  borderColor: '#0d9488 !important',
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.04)',
                },
              }}
            >
              <Icon sx={{ fontSize: 28 }} />
              <Typography
                variant="caption"
                sx={{ fontSize: 10, lineHeight: 1 }}
              >
                {label}
              </Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Box sx={{ height: '0.5px', bgcolor: '#1e1e22', my: 3 }} />

        <Typography
          sx={{
            mb: 1.5,
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.7px',
            textTransform: 'uppercase',
            color: '#333',
          }}
        >
          Cores
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          {getColorTargets().map((item) => (
            <Box
              key={item.index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 1,
                py: 0.75,
                borderRadius: '6px',
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: '#888', fontSize: '0.8rem' }}
              >
                {item.label}
              </Typography>

              <ColorSwatch
                color={chart.options?.colors?.[item.index] ?? '#0d9488'}
                onChange={(newColor) =>
                  onColorChange(chart.id, item.index, newColor)
                }
              />
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            onClick={onClose}
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: 1,
              border: '0.5px solid #2a2a2e',
              bgcolor: 'transparent',
              color: '#888',
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: 1,
              border: 'none',
              bgcolor: '#0d9488',
              color: '#f0fdfb',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: '#0b7a70' },
            }}
          >
            Aplicar
          </Button>
        </Box>
      </Paper>
    </Modal>
  )
}

export default ChartConfigModal
