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

const CHART_TYPES = [
  { value: 'bar', label: 'Barras', Icon: BarChartIcon },
  { value: 'line', label: 'Linha', Icon: ShowChartIcon },
  { value: 'area', label: 'Área', Icon: AreaChartIcon },
  { value: 'pie', label: 'Pizza', Icon: PieChartIcon },
  { value: 'donut', label: 'Donut', Icon: DonutLargeIcon },
]

const ChartConfigModal = ({ open, onClose, chart, allCharts, onApply }) => {
  const [selectedType, setSelectedType] = useState(chart.type)

  const handleApply = () => {
    onApply({
      chartId: chart.id,
      newType: selectedType,
      newOrder: allCharts.map((c) => c.id),
    })
    onClose()
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
          bgcolor: '#1E1E1E',
          border: '1px solid #3F3F3F',
          borderRadius: 2,
          p: 3,
          outline: 'none',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ mb: 2, fontWeight: 600, color: '#fff' }}
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
                color: '#aaa',
                border: '1px solid #3F3F3F !important',
                borderRadius: '8px !important',
                '&.Mui-selected': {
                  bgcolor: 'rgba(37,99,235,0.15)',
                  color: '#60A5FA',
                  borderColor: '#2563eb !important',
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

        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}
        >
          <Box
            component={Button}
            onClick={onClose}
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: 1,
              border: '1px solid #3F3F3F',
              bgcolor: 'transparent',
              color: '#aaa',
            }}
          >
            Cancelar
          </Box>
          <Box
            component={Button}
            onClick={handleApply}
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: 1,
              border: 'none',
              bgcolor: '#2563eb',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            Aplicar
          </Box>
        </Box>
      </Paper>
    </Modal>
  )
}

export default ChartConfigModal
