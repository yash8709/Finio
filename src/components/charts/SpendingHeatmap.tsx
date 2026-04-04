import { useMemo } from 'react'
import type { Transaction } from '../../types'
import { format, subDays, startOfWeek, isSameDay } from 'date-fns'

interface HeatmapProps {
  transactions: Transaction[]
}

const WEEKS = 6
const DAYS = 7

export function SpendingHeatmap({ transactions }: HeatmapProps) {
  const dataset = useMemo(() => {
    const today = new Date()
    const startDate = startOfWeek(subDays(today, (WEEKS - 1) * DAYS), { weekStartsOn: 1 }) // start on Monday
    
    const days = []
    
    for (let w = 0; w < WEEKS; w++) {
      const week = []
      for (let d = 0; d < DAYS; d++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + w * DAYS + d)
        
        // Compute total spend on this day
        const dailySpend = transactions
          .filter(t => t.type === 'expense' && isSameDay(new Date(t.date), currentDate))
          .reduce((sum, t) => sum + t.amount, 0)
          
        week.push({ date: currentDate, amount: dailySpend })
      }
      days.push(week)
    }
    
    return { startDate, days }
  }, [transactions])

  const getColor = (amount: number) => {
    if (amount === 0) return 'var(--heatmap-empty)'
    if (amount <= 500) return 'rgba(16,185,129,0.25)'
    if (amount <= 2000) return 'rgba(16,185,129,0.50)'
    if (amount <= 5000) return 'rgba(16,185,129,0.75)'
    return 'rgba(16,185,129,1.00)'
  }

  const CELL_SIZE = 14
  const CELL_GAP = 3
  const ROW_HEIGHT = CELL_SIZE + CELL_GAP
  const TOP_OFFSET = 32
  const LEFT_OFFSET = 32

  const labelRows = [
    { label: 'Mon', row: 0 },
    { label: 'Wed', row: 2 },
    { label: 'Fri', row: 4 },
    { label: 'Sun', row: 6 },
  ]

  return (
    <div className="flex items-start mt-2">
      <div className="flex-1 overflow-x-auto pb-4">
        <svg height={TOP_OFFSET + DAYS * ROW_HEIGHT + 10} className="min-w-max" width={LEFT_OFFSET + WEEKS * ROW_HEIGHT + 10}>
          
          {/* Day Labels */}
          {labelRows.map(({ label, row }) => (
            <text
              key={label}
              x={0}
              y={TOP_OFFSET + row * ROW_HEIGHT + CELL_SIZE / 2 + 4}
              fontSize={10}
              fill="var(--text-muted)"
              dominantBaseline="middle"
            >
              {label}
            </text>
          ))}

          {/* Columns (Weeks) */}
          {dataset.days.map((week, wIndex) => {
            const x = LEFT_OFFSET + wIndex * ROW_HEIGHT
            const showMonthLabel = wIndex % 2 === 0
            
            return (
              <g key={wIndex}>
                {showMonthLabel && (
                  <text 
                    x={x} 
                    y={16} 
                    fill="var(--text-muted)" 
                    fontSize={10} 
                    fontFamily="Sora"
                  >
                    {format(week[0].date, 'MMM d')}
                  </text>
                )}
                
                {/* Rows (Days) */}
                {week.map((day, dIndex) => {
                  const y = TOP_OFFSET + dIndex * ROW_HEIGHT
                  return (
                    <g key={dIndex}>
                      <title>{format(day.date, 'MMM d, yyyy')}: ₹{day.amount}</title>
                      <rect
                        x={x}
                        y={y}
                        width={CELL_SIZE}
                        height={CELL_SIZE}
                        rx={3}
                        fill={getColor(day.amount)}
                        stroke="var(--border-card)"
                        strokeWidth={1}
                        className="transition-colors hover:stroke-white hover:stroke-1"
                      />
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
