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
import { GlassCard } from '../ui/GlassCard'
import type { MonthlyData } from '../../types'
import { formatINR } from '../../utils/formatters'

interface AreaChartProps {
  data: MonthlyData[]
  title: string
  subtitle: string
}

type Period = '1M' | '3M' | '6M'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-[#1a1f2d] border border-white/10 rounded-xl px-4 py-3 shadow-xl shadow-black/40">
      <p className="text-xs text-white/40 mb-2 font-medium">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor:
                entry.dataKey === 'income'
                  ? '#818CF8'
                  : entry.dataKey === 'expenses'
                    ? '#FB7185'
                    : '#10B981',
            }}
          />
          <span className="text-white/60 capitalize">{entry.dataKey}:</span>
          <span className="font-mono font-semibold text-white">{formatINR(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function AreaChart({ data, title, subtitle }: AreaChartProps) {
  const [period, setPeriod] = useState<Period>('6M')

  const filteredData = (() => {
    switch (period) {
      case '1M':
        return data.slice(-1)
      case '3M':
        return data.slice(-3)
      case '6M':
      default:
        return data
    }
  })()

  return (
    <GlassCard className="p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
                px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer
                ${period === p
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/60'
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
          <RechartsAreaChart data={filteredData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#balanceGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#10B981', stroke: '#080D1A', strokeWidth: 2 }}
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}
