import { useState } from 'react'

import { Box, IconButton } from '@mui/material'
import {
  Settings as SettingsIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material'
import Chart from 'react-apexcharts'

import { ChartConfigModal } from './components'
import { ChartColorsModal } from './components'

const isPolar = (type) => ['pie', 'donut'].includes(type)

const normalizeSeries = (series, type) => {
  if (!Array.isArray(series)) return []

  if (isPolar(type)) {
    return series.map((s) => {
      if (typeof s === 'number') return s
      if (typeof s === 'object' && s !== null) return Number(s.y ?? s.data ?? 0)
      return 0
    })
  }

  return series.map((s) => {
    if (typeof s !== 'object' || s === null) {
      return { name: 'Série', data: [] }
    }
    return {
      ...s,
      data: Array.isArray(s.data) ? s.data : [],
    }
  })
}

const ChartCard = ({
  chart,
  allCharts,
  onApply,
  dragListeners,
  onColorChange,
}) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [selectedBar, setSelectedBar] = useState(null)

  const safeSeries = normalizeSeries(chart.series, chart.type)

  const chartOptions = {
    ...(chart.options ?? {}),

    chart: {
      ...(chart.options?.chart ?? {}),

      events: {
        dataPointSelection: (event, chartContext, config) => {
          setSelectedBar(config.dataPointIndex)
          setColorModalOpen(true)
        },
      },
    },
  }
  console.log('ChartCard:', chart)

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          border: '1px solid #3F3F3F',
          borderRadius: 2,
          p: 1,
          bgcolor: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 1,
            display: 'flex',
            gap: 0.5,
          }}
        >
          <IconButton
            size="small"
            {...dragListeners}
            sx={{
              color: '#aaa',
              bgcolor: 'rgba(0,0,0,0.3)',
              cursor: 'grab',
              '&:active': { cursor: 'grabbing' },
              '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
            }}
          >
            <DragIndicatorIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => setModalOpen(true)}
            sx={{
              color: '#aaa',
              bgcolor: 'rgba(0,0,0,0.3)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>

        <Chart
          key={`${chart.id}-${chart.type}`}
          options={chartOptions}
          series={safeSeries}
          type={chart.type}
          width="100%"
          height={250}
        />
      </Box>

      {modalOpen && (
        <ChartConfigModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          chart={chart}
          allCharts={allCharts}
          onApply={onApply}
        />
      )}
      {colorModalOpen && (
        <ChartColorsModal
          open={colorModalOpen}
          onClose={() => setColorModalOpen(false)}
          chart={chart}
          onColorChange={onColorChange}
        />
      )}
    </>
  )
}

export default ChartCard
