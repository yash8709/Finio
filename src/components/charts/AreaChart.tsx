import { useState } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import type { MonthlyData } from '../../types'
import { formatINR } from '../../utils/formatters'
import { useUIStore } from '../../store/uiStore'

interface AreaChartProps {
  data: MonthlyData[]
  title: string
  subtitle: string
}

type Period = '1M' | '3M' | '6M'

function CustomTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload || !payload.length) return null

  return (
    <div style={{
      background: 'var(--bg-base)',
      border: '1px solid var(--border-card)',
      borderRadius: 12,
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      whiteSpace: 'nowrap'
    }}>
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: 11,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>{label}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {payload?.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <span style={{ color: entry.color, fontSize: 12, textTransform: 'capitalize' }}>
              {entry.name}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>
              {formatINR(Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AreaChart({ data, title, subtitle }: AreaChartProps) {
  const [period, setPeriod] = useState<Period>('6M')
  const isDarkMode = useUIStore((s) => s.isDarkMode)

  const colors = {
    emerald: isDarkMode ? '#10B981' : '#059669',
    rose:    isDarkMode ? '#F43F5E' : '#E11D48',
    sky:     isDarkMode ? '#38BDF8' : '#0284C7',
    gridLine: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)',
    axisText: isDarkMode ? '#6B7280' : '#94A3B8',
    cursorStroke: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    legendText: isDarkMode ? '#9CA3AF' : '#64748B',
  }

  const filteredData = (() => {
    switch (period) {
      case '1M': return data.slice(-1)
      case '3M': return data.slice(-3)
      case '6M': default: return data
    }
  })()

  return (
    <div className="glass-card p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-primary">{title}</h3>
          <p className="text-xs text-secondary uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>

        {/* Period tabs */}
        <div className="flex items-center gap-1 bg-[var(--input-bg)] rounded-lg p-1">
          {(['1M', '3M', '6M'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`
                px-3 py-1 text-xs rounded-lg transition-all duration-200 cursor-pointer
                ${period === p
                  ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                  : 'text-secondary hover:text-primary'
                }
              `}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={filteredData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(56,189,248,0.3)" />
                <stop offset="100%" stopColor="rgba(56,189,248,0)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLine} vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: colors.axisText, fontSize: 11 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              width={60}
              tick={{ fill: colors.axisText, fontSize: 12 }} 
              tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} 
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: colors.cursorStroke, strokeWidth: 1, strokeDasharray: '4 4' }} 
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              wrapperStyle={{ fontSize: 12, paddingBottom: 16, color: colors.legendText, opacity: 0.7 }}
            />
            
            <Area
              type="monotone"
              dataKey="balance"
              name="Balance"
              stroke={colors.sky}
              strokeWidth={3}
              fill="url(#balanceGradient)"
              activeDot={{ r: 4, fill: colors.sky, stroke: `${colors.sky}4D`, strokeWidth: 8 }}
            />
            <Line 
              type="monotone" 
              dataKey="income" 
              name="Income" 
              stroke={colors.emerald} 
              strokeWidth={1.5} 
              strokeOpacity={0.7}
              dot={false} 
              activeDot={{ r: 4, fill: colors.emerald, strokeWidth: 0 }} 
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              name="Expenses" 
              stroke={colors.rose} 
              strokeWidth={1.5} 
              strokeOpacity={0.7}
              dot={false} 
              activeDot={{ r: 4, fill: colors.rose, strokeWidth: 0 }} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
