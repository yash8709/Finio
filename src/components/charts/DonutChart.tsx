import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { GlassCard } from '../ui/GlassCard'
import type { CategoryBreakdown } from '../../types'
import { getCategoryColor } from '../../utils/categoryColors'
import { formatINR } from '../../utils/formatters'

interface DonutChartProps {
  data: CategoryBreakdown[]
  title: string
  subtitle: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: CategoryBreakdown
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const item = payload[0].payload

  return (
    <div className="bg-[#1a1f2d] border border-white/10 rounded-xl px-4 py-3 shadow-xl shadow-black/40">
      <p className="text-xs text-white/40 mb-1">{item.category}</p>
      <p className="font-mono font-semibold text-white text-sm">{formatINR(item.total)}</p>
      <p className="text-xs text-white/40 mt-0.5">{item.percentage}% of total</p>
    </div>
  )
}

export function DonutChart({ data, title, subtitle }: DonutChartProps) {
  const totalExpenses = data.reduce((sum, d) => sum + d.total, 0)

  return (
    <GlassCard className="p-6 flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-xs text-white/30 uppercase tracking-widest mt-0.5">{subtitle}</p>
      </div>

      {/* Chart + center label */}
      <div className="relative flex-shrink-0" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="total"
              nameKey="category"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={getCategoryColor(entry.category)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Total</span>
          <span className="text-xl font-mono font-bold text-white">{formatINR(totalExpenses)}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4">
        {data.slice(0, 8).map((entry) => (
          <div key={entry.category} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: getCategoryColor(entry.category) }}
            />
            <span className="text-xs text-white/50 truncate">
              {entry.category.length > 12
                ? entry.category.split(' ')[0]
                : entry.category}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
