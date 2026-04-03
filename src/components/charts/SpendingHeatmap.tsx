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
    if (amount === 0) return 'rgba(255,255,255,0.04)'
    if (amount <= 500) return 'rgba(16,185,129,0.2)'
    if (amount <= 2000) return 'rgba(16,185,129,0.5)'
    return 'rgba(16,185,129,0.9)'
  }

  // Monday, Wednesday, Friday indexing (0 is Mon, 2 is Wed, 4 is Fri in our array)
  const yLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun']

  return (
    <div className="flex items-start gap-4 mt-6">
      <div className="flex flex-col gap-[14px] mt-6 text-[10px] text-gray-500 font-medium">
        {yLabels.map((l, i) => (
          <span key={i} className="h-[14px] flex items-center leading-none">{l}</span>
        ))}
      </div>
      
      <div className="flex-1 overflow-x-auto pb-4">
        <svg height={DAYS * 18 + 20} className="min-w-max">
          {/* Columns (Weeks) */}
          {dataset.days.map((week, wIndex) => {
            const x = wIndex * 18
            const showMonthLabel = wIndex % 2 === 0 // Show every 2 weeks to avoid clutter
            
            return (
              <g key={wIndex}>
                {showMonthLabel && (
                  <text 
                    x={x} 
                    y={12} 
                    fill="#6B7280" 
                    fontSize={10} 
                    fontFamily="Sora"
                  >
                    {format(week[0].date, 'MMM d')}
                  </text>
                )}
                
                {/* Rows (Days) */}
                {week.map((day, dIndex) => {
                  const y = dIndex * 18 + 24
                  return (
                    <g key={dIndex}>
                      <title>{format(day.date, 'MMM d, yyyy')}: ₹{day.amount}</title>
                      <rect
                        x={x}
                        y={y}
                        width={14}
                        height={14}
                        rx={3}
                        fill={getColor(day.amount)}
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
