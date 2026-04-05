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
import { formatINR } from '../../utils/formatters'
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
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-[var(--bg-base)] border border-theme rounded-xl px-4 py-3 shadow-xl shadow-black/40">
      <p className="text-xs text-secondary mb-2 font-medium">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.fill }}
          />
          <span className="text-secondary capitalize">{entry.dataKey}:</span>
          <span className="font-mono font-semibold text-primary">{formatINR(entry.value)}</span>
        </div>
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
    gridLine: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)',
    axisText: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
    cursorFill: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
  }
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
              stroke={colors.gridLine}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: colors.axisText, fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: colors.axisText, fontSize: 11 }}
              tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
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
