import { motion } from 'framer-motion'
import {
  TrendingUp,
  Zap,
  TrendingDown,
  Lightbulb,
} from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { BarChart } from '../components/charts/BarChart'
import { SpendingHeatmap } from '../components/charts/SpendingHeatmap'
import { useInsights } from '../hooks/useInsights'
import { useTransactionStore } from '../store/transactionStore'
import { formatINR } from '../utils/formatters'
import { getCategoryColor } from '../utils/categoryColors'

// ─── Animation variants ─────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.07 },
  },
}

const cardVariant = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

export function Insights() {
  const insights = useInsights()
  const transactions = useTransactionStore((s) => s.transactions)

  return (
    <motion.div
      className="space-y-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* ─── Top 3 Insight Cards ────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Card 1 — Top Expenditure */}
        <motion.div variants={cardVariant}>
          <GlassCard hoverable className="p-5 border-l-[3px] border-l-emerald-500">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">
              Top Expenditure
            </p>
            <h3 className="text-xl font-semibold text-white mb-1">
              {insights.topCategory}
            </h3>
            <p className="font-mono text-lg font-bold text-white/80">
              {formatINR(insights.topCategoryAmount)}
              <span className="text-xs text-white/30 font-sans font-normal">/mo</span>
            </p>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-white/30">Budget Utilization</span>
                <span className="font-mono text-emerald-400">{insights.topCategoryPercentage}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(insights.topCategoryPercentage, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Card 2 — Runway Projection */}
        <motion.div variants={cardVariant}>
          <GlassCard hoverable className="p-5 border-l-[3px] border-l-indigo-500">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">
              Runway Projection
            </p>
            <h3 className="text-xl font-semibold text-indigo-400 mb-3">
              <span className="font-mono text-2xl font-bold">{insights.runwayMonths}</span>{' '}
              <span className="text-base">months</span>
            </h3>

            <div className="flex items-center gap-2 text-white/40">
              <TrendingUp size={14} className="text-indigo-400" />
              <span className="text-[10px] uppercase tracking-widest">Surplus Forecast</span>
            </div>
            <p className="font-mono text-lg font-bold text-white mt-1">
              {formatINR(insights.surplusForecast)}
            </p>
          </GlassCard>
        </motion.div>

        {/* Card 3 — Performance Peak */}
        <motion.div variants={cardVariant}>
          <GlassCard hoverable className="p-5 border-l-[3px] border-l-amber-500">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">
              Performance Peak
            </p>
            <h3 className="text-xl font-semibold text-white mb-1">
              {insights.bestMonth} {new Date().getFullYear()}
            </h3>
            <p className="text-sm text-white/40">
              <span className="font-mono text-white/60">{formatINR(insights.bestMonthSavings)}</span>{' '}
              net savings
            </p>

            {/* Mini sparkline bars */}
            <div className="flex items-end gap-[3px] mt-4 h-10">
              {insights.monthlyData.map((m, i) => {
                const maxBalance = Math.max(
                  ...insights.monthlyData.map((d) => Math.abs(d.balance)),
                  1,
                )
                const height = Math.max((Math.abs(m.balance) / maxBalance) * 100, 8)
                const isBest = m.month === insights.bestMonth

                return (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.05, ease: 'easeOut' }}
                    style={{
                      backgroundColor: isBest ? '#F59E0B' : 'rgba(255,255,255,0.08)',
                    }}
                  />
                )
              })}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* ─── Income vs Expenses BarChart ────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <BarChart
          data={insights.monthlyData}
          title="Income vs. Expenses"
          subtitle="Monthly comparison"
        />
      </motion.div>

      {/* ─── Two column: Category Distribution + Alerts ── */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        {/* Left — Category Distribution */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-1">Category Distribution</h3>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-6">
            Expense breakdown by category
          </p>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_120px_1fr_60px] gap-4 mb-3 px-1">
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
              Category
            </span>
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
              Total Spent
            </span>
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
            </span>
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium text-right">
              % of Total
            </span>
          </div>

          {/* Category rows */}
          <div className="space-y-3">
            {insights.categoryBreakdown.map((cat, idx) => (
              <div
                key={cat.category}
                className="grid grid-cols-[1fr_120px_1fr_60px] gap-4 items-center px-1 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors"
              >
                {/* Category name + dot */}
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: getCategoryColor(cat.category) }}
                  />
                  <span className="text-sm text-white/80">{cat.category}</span>
                </div>

                {/* Total */}
                <span className="font-mono text-sm text-white font-medium">
                  {formatINR(cat.total)}
                </span>

                {/* Progress bar */}
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 0.6, delay: 0.5 + idx * 0.05, ease: 'easeOut' }}
                    style={{ backgroundColor: getCategoryColor(cat.category) }}
                  />
                </div>

                {/* Percentage */}
                <span className="font-mono text-xs text-white/40 text-right">
                  {cat.percentage}%
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Right — Insights Alerts */}
        <div className="space-y-4">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Insights Alerts</h3>

            <div className="space-y-3">
              {insights.anomalies.slice(0, 3).map((anomaly, i) => (
                <motion.div
                  key={i}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:border-white/8 transition-all"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                      {i === 0 ? (
                        <Zap size={18} className="text-rose-400" />
                      ) : (
                        <TrendingDown size={18} className="text-rose-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-white">
                          Unusual Spend
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400">
                          {anomaly.multiplier}x
                        </span>
                      </div>
                      <p className="text-xs text-white/40 leading-relaxed">
                        {anomaly.transaction.category} expenses are{' '}
                        <span className="text-rose-400 font-semibold underline decoration-rose-400/30">
                          {anomaly.multiplier}x higher
                        </span>{' '}
                        than your monthly average.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Pro-tip Card */}
          <GlassCard className="p-5 border border-emerald-500/15 bg-emerald-500/[0.03]">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={14} className="text-emerald-400" />
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
                Pro-Tip
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white mb-1.5">
              Optimize Your Spending
            </h4>
            <p className="text-xs text-white/40 leading-relaxed mb-3">
              By reducing your <span className="text-white/70">{insights.topCategory}</span> spending by 20%,
              you could save an extra:
            </p>
            <p className="font-mono text-xl font-bold text-emerald-400">
              {formatINR(Math.round(insights.topCategoryAmount * 0.2 * 12))}
              <span className="text-xs text-emerald-400/50 font-sans font-normal ml-1">/yr</span>
            </p>
          </GlassCard>
        </div>
      </motion.div>

      {/* ─── Spending Activity Heatmap ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <GlassCard className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Spending Activity</h3>
            <p className="text-xs text-white/30 uppercase tracking-widest mt-0.5">
              Last 6 weeks
            </p>
          </div>
          <SpendingHeatmap transactions={transactions} />
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
