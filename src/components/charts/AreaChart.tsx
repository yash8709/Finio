import { useState } from 'react'
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { MonthlyData } from '../../types'
import { formatINR } from '../../utils/formatters'

interface AreaChartProps {
  data: MonthlyData[]
  title: string
  subtitle: string
}

type Period = '1M' | '3M' | '6M'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  const value = payload[0].value

  return (
    <div style={{
      background:'rgba(8,13,26,0.9)',
      border:'1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding:'8px 12px'
    }}>
      <p style={{
        fontFamily:'JetBrains Mono',
        color:'#10B981',fontSize:14
      }}>{formatINR(value)}</p>
      <p style={{
        color:'#6B7280',fontSize:11
      }}>{label}</p>
    </div>
  )
}

export function AreaChart({ data, title, subtitle }: AreaChartProps) {
  const [period, setPeriod] = useState<Period>('6M')

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
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-xs text-white/30 uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>

        {/* Period tabs */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {(['1M', '3M', '6M'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`
                px-3 py-1 text-xs rounded-lg transition-all duration-200 cursor-pointer
                ${period === p
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-gray-500 hover:text-gray-300'
                }
              `}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart data={filteredData} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
                <stop offset="100%" stopColor="rgba(16,185,129,0)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#balanceGradient)"
              activeDot={{ r: 4, fill: "#10B981", stroke: "rgba(16,185,129,0.3)", strokeWidth: 8 }}
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
