import { useEffect, useState } from 'react'

import { Grid, Skeleton } from '@mui/material'
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

const initializeCharts = (charts) =>
  charts.map((chart) => {
    const type = chart.type ?? chart.chartType
    const isPolar = ['pie', 'donut'].includes(type)

    const series = isPolar ? chart.series.flatMap((s) => s.data) : chart.series

    return {
      ...chart,
      type,
      series,
      options: mergeChartConfig({
        ...chart.options,
        ...(isPolar && { labels: chart.categories }),
        chart: { type },
        xaxis: isPolar ? {} : { categories: chart.categories },
      }),
    }
  })

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
  const [charts, setCharts] = useState(() => initializeCharts(initialCharts))
  const [ready, setReady] = useState(false)

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

      // Cartesiano → Polar
      if (!currentIsPolar && nextIsPolar) {
        const categories = c.categories ?? c.options?.xaxis?.categories ?? []

        const series = categories.map((_, i) =>
          c.series.reduce((acc, s) => {
            const point = s.data?.[i]
            const val = typeof point === 'object' ? (point.y ?? point) : point
            return acc + (Number(val) || 0)
          }, 0),
        )

        return {
          ...c,
          type: newType,
          series,
          _originalSeries: c._originalSeries ?? c.series,
          options: mergeChartConfig({
            ...c.options,
            labels: categories,
            chart: { ...c.options?.chart, type: newType },
            xaxis: {},
          }),
        }
      }

      // Polar → Cartesiano
      if (currentIsPolar && !nextIsPolar) {
        const categories =
          c.options?.labels ??
          c.categories ??
          c.options?.xaxis?.categories ??
          []

        const series = c._originalSeries
          ? c._originalSeries.map((s) => ({
              ...s,
              data: s.data.map((point) =>
                typeof point === 'object' ? (point.y ?? point) : point,
              ),
            }))
          : [
              {
                name: 'Valor',
                data: (Array.isArray(c.series) ? c.series : []).map((val) =>
                  typeof val === 'object' ? (val.y ?? val) : val,
                ),
              },
            ]

        const { labels: _removed, ...cleanOptions } = c.options ?? {}

        return {
          ...c,
          type: newType,
          series,
          _originalSeries: undefined,
          options: mergeChartConfig({
            ...cleanOptions,
            chart: { ...cleanOptions?.chart, type: newType },
            xaxis: { categories },
          }),
        }
      }

      return {
        ...c,
        type: newType,
        options: mergeChartConfig({
          ...c.options,
          chart: { ...c.options?.chart, type: newType },
        }),
      }
    })

    const reordered = newOrder.map((id) => updated.find((c) => c.id === id))
    setCharts(reordered)
  }

  const cols = Math.min(charts.length, 4)

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

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
          {ready
            ? charts.map((chart) => (
                <SortableChart
                  key={chart.id}
                  chart={chart}
                  allCharts={charts}
                  onApply={handleApply}
                  cols={cols}
                />
              ))
            : charts.map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 12 / cols }}>
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={300}
                    sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
                  />
                </Grid>
              ))}
        </Grid>
      </SortableContext>
    </DndContext>
  )
}

export default ChartsBlock
