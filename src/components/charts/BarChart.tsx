import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { GlassCard } from '../ui/GlassCard'
import type { MonthlyData } from '../../types'
import { useUIStore } from '../../store/uiStore'

interface BarChartProps {
  data: MonthlyData[]
  title: string
  subtitle: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; fill: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  const isDarkMode = useUIStore((s) => s.isDarkMode)
  
  const tooltipBg = isDarkMode ? 'rgba(15,20,40,0.95)' : 'rgba(255,255,255,0.98)'
  const tooltipBorder = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)'
  const tooltipText = isDarkMode ? '#F9FAFB' : '#0F172A'

  if (!active || !payload?.length) return null

  return (
    <div style={{
      background: tooltipBg,
      border: `1px solid ${tooltipBorder}`,
      borderRadius: 12,
      padding: '10px 14px',
    }}>
      <p style={{ color: tooltipText, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        {label}
      </p>
      {payload.map((entry: any) => (
        <p key={entry.name || entry.dataKey} style={{ 
          color: entry.color || entry.fill, 
          fontSize: 12,
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          {entry.name || entry.dataKey}: ₹{entry.value?.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  )
}

interface CustomLegendProps {
  payload?: Array<{ value: string; color: string }>
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload) return null

  return (
    <div className="flex items-center justify-end gap-5 mb-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-secondary capitalize">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function BarChart({ data, title, subtitle }: BarChartProps) {
  const isDarkMode = useUIStore((s) => s.isDarkMode)

  const colors = {
    indigo:   isDarkMode ? '#818CF8' : '#6366F1',
    rose:     isDarkMode ? '#FB7185' : '#E11D48',
    gridLine: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
    axisText: isDarkMode ? '#818CF8' : '#94A3B8', // we'll use #4B5563 for dark mode but user selected 818CF8 for indigo. Actually let's use the explicit ones for grid and axis
    cursorFill: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
  }
  
  const axisColor = isDarkMode ? '#4B5563' : '#94A3B8'
  const gridColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'
  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-primary">{title}</h3>
          <p className="text-xs text-muted uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -15 }} barGap={4} barSize={18}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={gridColor} 
              vertical={false} 
            />
            <XAxis 
              dataKey="month"
              tick={{ fill: axisColor, fontSize: 12 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: axisColor, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v/1000}k`}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.cursorFill }} />
            <Legend content={<CustomLegend />} />
            <Bar
              dataKey="income"
              fill={colors.indigo}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              fill={colors.rose}
              radius={[4, 4, 0, 0]}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}
