import { useMemo } from 'react'
import { format, subDays, startOfDay } from 'date-fns'
import type { Transaction } from '../../types'

interface SpendingHeatmapProps {
  transactions: Transaction[]
}

const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', '']
const CELL_SIZE = 14
const GAP = 3

export function SpendingHeatmap({ transactions }: SpendingHeatmapProps) {
  const { grid, weekLabels } = useMemo(() => {
    const today = startOfDay(new Date())
    const days = 42 // 7 × 6 weeks

    // Group expenses by date
    const dailySpend = new Map<string, number>()
    for (const t of transactions) {
      if (t.type === 'expense') {
        const key = format(t.date, 'yyyy-MM-dd')
        dailySpend.set(key, (dailySpend.get(key) || 0) + t.amount)
      }
    }

    // Build grid: 7 rows (Mon–Sun) × 6 columns (weeks)
    const cells: { date: Date; spend: number; row: number; col: number; dateStr: string }[] = []
    const startDate = subDays(today, days - 1)
    const wLabels: string[] = []

    for (let i = 0; i < days; i++) {
      const date = subDays(today, days - 1 - i)
      const dayOfWeek = (date.getDay() + 6) % 7 // Mon=0, Sun=6
      const weekIndex = Math.floor(i / 7)
      const dateStr = format(date, 'yyyy-MM-dd')
      const spend = dailySpend.get(dateStr) || 0

      cells.push({ date, spend, row: dayOfWeek, col: weekIndex, dateStr })

      // Collect week start labels
      if (dayOfWeek === 0) {
        wLabels.push(format(date, 'dd MMM'))
      }
    }

    return { grid: cells, weekLabels: wLabels }
  }, [transactions])

  function getFillColor(spend: number): string {
    if (spend === 0) return 'rgba(255, 255, 255, 0.04)'
    if (spend < 500) return 'rgba(16, 185, 129, 0.20)'
    if (spend <= 2000) return 'rgba(16, 185, 129, 0.50)'
    return 'rgba(16, 185, 129, 0.90)'
  }

  const svgWidth = 6 * (CELL_SIZE + GAP) + CELL_SIZE + 40 // 6 cols + labels
  const svgHeight = 7 * (CELL_SIZE + GAP) + CELL_SIZE + 28 // 7 rows + labels

  return (
    <div className="w-full overflow-x-auto">
      <svg width={svgWidth} height={svgHeight} className="mx-auto">
        {/* Day labels (left side) */}
        {DAY_LABELS.map((label, i) => (
          label && (
            <text
              key={`day-${i}`}
              x={0}
              y={28 + i * (CELL_SIZE + GAP) + CELL_SIZE / 2}
              fill="rgba(255,255,255,0.25)"
              fontSize={10}
              dominantBaseline="middle"
              fontFamily="'Sora', sans-serif"
            >
              {label}
            </text>
          )
        ))}

        {/* Week labels (top) */}
        {weekLabels.map((label, i) => (
          <text
            key={`week-${i}`}
            x={40 + i * (CELL_SIZE + GAP) + CELL_SIZE / 2}
            y={14}
            fill="rgba(255,255,255,0.25)"
            fontSize={9}
            textAnchor="middle"
            fontFamily="'Sora', sans-serif"
          >
            {i % 2 === 0 ? label : ''}
          </text>
        ))}

        {/* Cells */}
        {grid.map((cell, i) => (
          <rect
            key={i}
            x={40 + cell.col * (CELL_SIZE + GAP)}
            y={24 + cell.row * (CELL_SIZE + GAP)}
            width={CELL_SIZE}
            height={CELL_SIZE}
            rx={3}
            fill={getFillColor(cell.spend)}
            className="transition-all duration-150"
          >
            <title>
              {format(cell.date, 'EEE, dd MMM yyyy')}: {cell.spend > 0 ? `₹${cell.spend.toLocaleString('en-IN')}` : 'No spending'}
            </title>
          </rect>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="text-[10px] text-white/25">Less</span>
        {[
          'rgba(255,255,255,0.04)',
          'rgba(16,185,129,0.20)',
          'rgba(16,185,129,0.50)',
          'rgba(16,185,129,0.90)',
        ].map((color, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: color }}
          />
        ))}
        <span className="text-[10px] text-white/25">More</span>
      </div>
    </div>
  )
}
