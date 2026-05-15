import { useState } from 'react'

import { Grid } from '@mui/material'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { ChartCard } from './components'

const DEFAULT_CHART_CONFIG = {
  chart: {
    background: 'transparent',
    theme: { mode: 'dark' },
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  tooltip: {
    theme: 'dark',
  },
  legend: {
    labels: {
      colors: '#aaaaaa',
    },
  },
  xaxis: {
    labels: {
      style: {
        colors: '#aaaaaa',
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: '#aaaaaa',
      },
    },
  },
}

const mergeChartConfig = (customOptions = {}) => {
  return {
    ...DEFAULT_CHART_CONFIG,
    ...customOptions,
    chart: {
      ...DEFAULT_CHART_CONFIG.chart,
      ...customOptions?.chart,
    },
    legend: {
      ...DEFAULT_CHART_CONFIG.legend,
      ...customOptions?.legend,
    },
    xaxis: {
      ...DEFAULT_CHART_CONFIG.xaxis,
      ...customOptions?.xaxis,
    },
    yaxis: {
      ...DEFAULT_CHART_CONFIG.yaxis,
      ...customOptions?.yaxis,
    },
  }
}

const initializeCharts = (charts) => {
  return charts.map((chart) => ({
    ...chart,
    options: mergeChartConfig(chart.options),
  }))
}

const SortableChart = ({ chart, allCharts, onApply, cols }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chart.id })

  return (
    <Grid
      ref={setNodeRef}
      size={{ xs: 12, sm: cols > 1 ? 6 : 12, md: 12 / cols }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : 'auto',
      }}
      {...attributes}
    >
      <ChartCard
        chart={chart}
        allCharts={allCharts}
        onApply={onApply}
        dragListeners={listeners}
      />
    </Grid>
  )
}

const ChartsBlock = ({ charts: initialCharts }) => {
  const [charts, setCharts] = useState(initialCharts)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    setCharts((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === active.id)
      const newIndex = prev.findIndex((c) => c.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  const handleApply = ({ chartId, newType, newOrder }) => {
    const updated = charts.map((c) => {
      if (c.id !== chartId) return c

      const currentIsPolar = ['pie', 'donut'].includes(c.type)
      const nextIsPolar = ['pie', 'donut'].includes(newType)

      let newSeries = c.series

      if (!currentIsPolar && nextIsPolar) {
        newSeries = c.series.flatMap((s) => s.data)
      } else if (currentIsPolar && !nextIsPolar) {
        newSeries = [{ name: 'Série', data: c.series }]
      } else {
        return {
        ...c,
        type: newType,
        series: newSeries,
        options: {
          ...c.options,
          chart: { ...c.options.chart, type: newType },
        }}
      }
    })

    const reordered = newOrder.map((id) => updated.find((c) => c.id === id))
    setCharts(reordered)
  }

  const cols = Math.min(charts.length, 4)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={charts.map((c) => c.id)}
        strategy={rectSortingStrategy}
      >
        <Grid container spacing={2} sx={{ width: '100%', p: 1 }}>
          {charts.map((chart) => (
            <SortableChart
              key={chart.id}
              chart={chart}
              allCharts={charts}
              onApply={handleApply}
              cols={cols}
            />
          ))}
        </Grid>
      </SortableContext>
    </DndContext>
  )
}

export default ChartsBlock
