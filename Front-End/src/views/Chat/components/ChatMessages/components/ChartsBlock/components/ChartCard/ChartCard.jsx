import { useState } from 'react'

import { Box, IconButton, Typography } from '@mui/material'
import {
  Settings as SettingsIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material'
import Chart from 'react-apexcharts'

import { ChartConfigModal, ChartColorsModal } from './components'

const isPolar = (type) => ['pie', 'donut'].includes(type)

const normalizeSeries = (series, type) => {
  if (!Array.isArray(series)) return []

  if (isPolar(type)) {
    // Formato [{name, data:[...]}] → extrai numbers
    if (series.length > 0 && typeof series[0] === 'object' && Array.isArray(series[0]?.data)) {
      return series[0].data.map((v) => Number(v) || 0)
    }
    return series.map((s) => {
      if (typeof s === 'number') return s
      if (typeof s === 'object' && s !== null) return Number(s.y ?? s.data ?? 0)
      return 0
    })
  }

  return series.map((s) => {
    if (typeof s !== 'object' || s === null) return { name: 'Série', data: [] }
    return { ...s, data: Array.isArray(s.data) ? s.data : [] }
  })
}

const getCats = (chart) =>
  isPolar(chart.type)
    ? (chart.options?.labels ?? [])
    : (chart.options?.xaxis?.categories ?? [])

const ChartCard = ({
  chart,
  allCharts,
  onApply,
  dragListeners,
  onColorChange,
  onFilter,
  activeFilter,
}) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [selectedBar, setSelectedBar] = useState(null)

  const safeSeries = normalizeSeries(chart.series, chart.type)
  const cats = getCats(chart)

  const chartOptions = {
    ...(chart.options ?? {}),
    chart: {
      ...(chart.options?.chart ?? {}),
      events: {
        dataPointSelection: (_event, _chartContext, config) => {
          const idx = config.dataPointIndex
          const category = cats[idx]

          // Se tem onFilter, propaga o filtro global
          if (category != null && onFilter) {
            onFilter(String(category))
          }

          // Também abre o modal de cores (comportamento original)
          setSelectedBar(idx)
          setColorModalOpen(true)
        },
        // Line e area: clique no ponto
        click: (_event, _chartContext, config) => {
          if (
            !isPolar(chart.type) &&
            chart.type !== 'bar' &&
            config?.dataPointIndex != null &&
            config.dataPointIndex >= 0
          ) {
            const category = cats[config.dataPointIndex]
            if (category != null && onFilter) {
              onFilter(String(category))
            }
          }
        },
      },
    },
    // Marcadores visíveis em line/area para facilitar clique
    ...((['line', 'area'].includes(chart.type)) && {
      markers: { size: 5, hover: { size: 8 }, cursor: 'pointer' },
    }),
  }

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          border: activeFilter ? '1px solid #0d9488' : '1px solid #3F3F3F',
          borderRadius: 2,
          p: 1,
          bgcolor: 'rgba(255, 255, 255, 0.02)',
          transition: 'border-color 0.2s',
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

        {chart.title && (
          <Typography
            sx={{
              fontSize: '0.7rem',
              color: '#444',
              mb: 0.5,
              px: 0.5,
              userSelect: 'none',
            }}
          >
            {chart.title}
          </Typography>
        )}

        <Chart
          key={`${chart.id}-${chart.type}-${JSON.stringify(chart.options?.colors)}-${activeFilter ?? ''}`}
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
          onColorChange={onColorChange}
        />
      )}
      {colorModalOpen && (
        <ChartColorsModal
          open={colorModalOpen}
          onClose={() => setColorModalOpen(false)}
          chart={chart}
          onColorChange={onColorChange}
          selectedBar={selectedBar}
        />
      )}
    </>
  )
}

export default ChartCard
