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

const DEFAULT_COLORS = [
  '#14b8a6',
  '#f59e0b',
  '#6366f1',
  '#ef4444',
  '#10b981',
  '#f97316',
  '#8b5cf6',
  '#06b6d4',
]

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
  charts.map((chart, index) => {
    const type = chart.type ?? chart.chartType
    const isPolar = ['pie', 'donut'].includes(type)
    const series = isPolar ? chart.series.flatMap((s) => s.data) : chart.series

    const totalColors = isPolar
      ? (chart.categories ?? []).length
      : type === 'bar'
        ? (chart.categories ?? []).length
        : (chart.series ?? []).length

    const initialColors = Array.from(
      { length: totalColors },
      (_, i) =>
        chart.options?.colors?.[i] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    )

    return {
      id: chart.id ?? `chart-${index}`,
      ...chart,
      type,
      series,
      options: mergeChartConfig({
        ...chart.options,
        colors: initialColors,
        ...(type === 'bar' && { plotOptions: { bar: { distributed: true } } }),
        ...(isPolar && { labels: chart.categories }),
        chart: { type },
        xaxis: isPolar ? {} : { categories: chart.categories },
      }),
    }
  })

const SortableChart = ({ chart, allCharts, onApply, cols, onColorChange }) => {
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
        onColorChange={onColorChange}
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

  const handleColorChange = (chartId, colorIndex, newColor) => {
    setCharts((prev) =>
      prev.map((chart) => {
        if (chart.id !== chartId) return chart

        const totalColors =
          chart.categories?.length ||
          chart.options?.labels?.length ||
          chart.series?.length ||
          0

        const colors = Array.from(
          { length: totalColors },
          (_, i) =>
            chart.options?.colors?.[i] ??
            DEFAULT_COLORS[i % DEFAULT_COLORS.length],
        )

        colors[colorIndex] = newColor

        return {
          ...chart,
          options: {
            ...chart.options,
            colors,
          },
        }
      }),
    )
  }

  const handleApply = ({ chartId, newType, newOrder }) => {
    setCharts((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== chartId) return c

        const currentIsPolar = ['pie', 'donut'].includes(c.type)
        const nextIsPolar = ['pie', 'donut'].includes(newType)
        const existingColors = c.options?.colors

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
              colors: existingColors,
              labels: categories,
              chart: { ...c.options?.chart, type: newType },
              xaxis: {},
            }),
          }
        }

        if (currentIsPolar && !nextIsPolar) {
          const categories = c.options?.labels ?? c.categories ?? []
          const series = c._originalSeries
            ? c._originalSeries.map((s) => ({
                ...s,
                data: s.data.map((point) =>
                  typeof point === 'object' ? (point.y ?? point) : point,
                ),
              }))
            : [{ name: 'Valor', data: Array.isArray(c.series) ? c.series : [] }]

          const { labels: _removed, ...cleanOptions } = c.options ?? {}
          return {
            ...c,
            type: newType,
            series,
            _originalSeries: undefined,
            options: mergeChartConfig({
              ...cleanOptions,
              colors: existingColors,
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
            colors: existingColors,
            chart: { ...c.options?.chart, type: newType },
          }),
        }
      })

      return newOrder.map((id) => updated.find((c) => c.id === id))
    })
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
                  onColorChange={handleColorChange}
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
