import { useState } from 'react'

import { Box, IconButton } from '@mui/material'
import {
  Settings as SettingsIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material'
import Chart from 'react-apexcharts'

import { ChartConfigModal } from './components'

const ChartCard = ({ chart, allCharts, onApply, dragListeners }) => {
  const [modalOpen, setModalOpen] = useState(false)

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

          {/* Configurações */}
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
          options={chart.options}
          series={chart.series}
          type={chart.type}
          width="100%"
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
    </>
  )
}

export default ChartCard
