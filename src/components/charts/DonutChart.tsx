import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { CategoryBreakdown } from '../../types'
import { formatINR } from '../../utils/formatters'

interface DonutChartProps {
  data: CategoryBreakdown[]
  title: string
  subtitle: string
}

function CustomTooltip({ active, payload, coordinate, viewBox }: any) {
  if (!active || !payload || !payload.length) return null
  const item = payload[0].payload
  
  // Safely get center X to determine if hovering left or right side
  const cx = viewBox?.width ? viewBox.width / 2 : 150
  const isLeft = coordinate?.x < cx
  
  // Push left if on left hemisphere, push right if on right hemisphere
  const transform = isLeft 
    ? 'translate(calc(-100% - 12px), -50%)' 
    : 'translate(12px, -50%)'

  return (
    <div style={{
      transform,
      background:'rgba(8,13,26,0.9)',
      border:'1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding:'8px 12px',
      pointerEvents: 'none',
      whiteSpace: 'nowrap'
    }}>
      <p style={{ color:'#6B7280', fontSize:11, marginBottom: 2 }}>{item.category}</p>
      <p style={{ fontFamily:'JetBrains Mono', color:'#fff', fontSize:14 }}>{formatINR(item.total)}</p>
      <p style={{ color:'#6B7280', fontSize:11, marginTop: 2 }}>{item.percentage}% of total</p>
    </div>
  )
}

function getCategoryColor(category: string): string {
  const c = category.toLowerCase()
  if (c.includes('food') || c.includes('dining')) return '#F59E0B' // amber
  if (c.includes('transport')) return '#818CF8' // indigo
  if (c.includes('health')) return '#10B981' // emerald
  if (c.includes('shopping')) return '#FB7185' // rose
  if (c.includes('bills') || c.includes('utilities')) return '#C084FC' // purple
  if (c.includes('entertainment')) return '#60A5FA' // blue
  return '#94A3B8' // slate
}

export function DonutChart({ data, title, subtitle }: DonutChartProps) {
  const totalExpenses = data.reduce((sum, d) => sum + d.total, 0)

  return (
    <div className="glass-card p-6 flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">{subtitle}</p>
      </div>

      {/* Chart + center label */}
      <div className="relative flex-shrink-0" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={4}
              dataKey="total"
              nameKey="category"
              stroke="none"
              cornerRadius={4}
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
          <span className="text-xs text-gray-500 uppercase tracking-widest">TOTAL</span>
          <span className="text-xl text-white mt-1 tabular-nums" style={{fontFamily:'JetBrains Mono'}}>
            {formatINR(totalExpenses)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-6 px-2">
        {data.slice(0, 8).map((entry) => (
          <div key={entry.category} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: getCategoryColor(entry.category) }}
            />
            <div className="flex justify-between w-full min-w-0">
              <span className="text-xs text-gray-400 truncate mr-2">
                {entry.category.length > 12 ? entry.category.split(' ')[0] : entry.category}
              </span>
              <span className="text-xs text-white tabular-nums">{entry.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
