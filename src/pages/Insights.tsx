import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  TrendingDown,
  Lightbulb,
  ShieldCheck,
  PiggyBank,
  BarChart3,
  PieChart,
  Flame,
  ShoppingBag,
  Shield,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { HealthScoreGauge } from '../components/ui/HealthScoreGauge'
import { BarChart } from '../components/charts/BarChart'
import { SpendingHeatmap } from '../components/charts/SpendingHeatmap'
import { useInsights } from '../hooks/useInsights'
import { useTransactionStore } from '../store/transactionStore'
import { formatINR } from '../utils/formatters'
import { computeHealthScore, interpretInsights } from '../utils/insights'
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

  // ─── Health Score ──────────────────────────────────────
  const healthScore = useMemo(() => computeHealthScore(transactions), [transactions])

  // ─── Actionable Insights ───────────────────────────────
  const actionableInsights = useMemo(() => interpretInsights(insights), [insights])

  // Dynamic interpretation text generators
  function getSavingsText(value: number): string {
    if (value > 30) return 'Excellent savings discipline'
    if (value >= 10) return 'Moderate savings — aim for 20%+'
    return 'Low savings rate — review expenses'
  }

  function getControlText(value: number): string {
    if (value < 10) return 'Stable spending month-over-month'
    if (value <= 25) return 'Some spending variance detected'
    return 'High variance — spending is inconsistent'
  }

  function getBalanceText(value: number): string {
    if (value < 30) return 'Well-distributed spending across categories'
    if (value <= 45) return 'One category dominates — consider rebalancing'
    return 'Single category consuming too much budget'
  }

  function getConsistencyText(value: number): string {
    if (value >= 3) return `${value} consecutive positive months — great streak`
    if (value >= 1) return 'Building consistency — keep going'
    return 'No positive balance months recorded'
  }

  const breakdownRows = [
    {
      label: 'Savings Rate',
      icon: PiggyBank,
      data: healthScore.breakdown.savingsRate,
      color: '#10B981',
      text: getSavingsText(healthScore.breakdown.savingsRate.value),
      valueLabel: `${healthScore.breakdown.savingsRate.value}% of income saved`,
    },
    {
      label: 'Spending Control',
      icon: BarChart3,
      data: healthScore.breakdown.spendingControl,
      color: '#818CF8',
      text: getControlText(healthScore.breakdown.spendingControl.value),
      valueLabel: `${healthScore.breakdown.spendingControl.value}% MoM variance`,
    },
    {
      label: 'Category Balance',
      icon: PieChart,
      data: healthScore.breakdown.categoryBalance,
      color: '#F59E0B',
      text: getBalanceText(healthScore.breakdown.categoryBalance.value),
      valueLabel: `Top category: ${healthScore.breakdown.categoryBalance.value}% of expenses`,
    },
    {
      label: 'Consistency',
      icon: Flame,
      data: healthScore.breakdown.consistency,
      color: '#34D399',
      text: getConsistencyText(healthScore.breakdown.consistency.value),
      valueLabel: `${healthScore.breakdown.consistency.value} positive months`,
    },
  ]

  // ─── Icon maps for actionable cards ────────────────────
  const INSIGHT_ICON_MAP = { ShoppingBag, Shield, Trophy } as const
  type InsightIconName = keyof typeof INSIGHT_ICON_MAP

  return (
    <motion.div
      className="space-y-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* ─── Health Score Breakdown ──────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 rounded-xl" style={{ background: `${healthScore.color}1A` }}>
              <ShieldCheck className="w-5 h-5" style={{ color: healthScore.color }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">Financial Health Score</h3>
              <p className="text-xs text-secondary uppercase tracking-widest mt-0.5">
                Comprehensive assessment of your financial habits
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Left — Large Gauge */}
            <div className="flex flex-col items-center lg:min-w-[280px] shrink-0">
              <HealthScoreGauge data={healthScore} size="large" />
              <div className="mt-2 flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: healthScore.color }}
                />
                <span className="text-sm font-medium" style={{ color: healthScore.color }}>
                  Grade {healthScore.grade}
                </span>
                <span className="text-xs text-secondary">·</span>
                <span className="text-sm text-secondary">{healthScore.label}</span>
              </div>
            </div>

            {/* Right — Breakdown Rows */}
            <div className="flex-1 w-full space-y-4">
              {breakdownRows.map((row, idx) => {
                const Icon = row.icon
                const progressPercent = (row.data.score / row.data.max) * 100
                return (
                  <motion.div
                    key={row.label}
                    className="group"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.2 + idx * 0.08, ease: 'easeOut' }}
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <div
                        className="p-1.5 rounded-lg shrink-0"
                        style={{ background: `${row.color}15` }}
                      >
                        <Icon size={14} style={{ color: row.color }} />
                      </div>
                      <span className="text-sm font-medium text-secondary flex-1">{row.label}</span>
                      <span
                        className="font-mono tabular-nums text-sm font-bold"
                        style={{ color: row.color }}
                      >
                        {row.data.score}<span className="text-secondary font-normal">/{row.data.max}</span>
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-1.5">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: row.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.7, delay: 0.3 + idx * 0.1, ease: 'easeOut' }}
                      />
                    </div>

                    {/* Interpretation text */}
                    <p className="text-xs text-secondary leading-relaxed">{row.text}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ─── Actionable Insight Cards ────────────────── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {actionableInsights.map((insight) => {
          const severityColor = {
            positive: '#10B981',
            warning: '#F59E0B',
            danger: '#FB7185',
            info: '#818CF8',
          }[insight.severity]

          const IconComponent = INSIGHT_ICON_MAP[insight.icon as InsightIconName] || ShoppingBag

          const TrendIcon = insight.trend === 'up'
            ? ArrowUpRight
            : insight.trend === 'down'
              ? ArrowDownRight
              : Minus

          const trendBadgeColor = insight.trend === 'up'
            ? (insight.severity === 'danger' || insight.severity === 'warning' ? '#FB7185' : '#10B981')
            : insight.trend === 'down'
              ? (insight.severity === 'positive' ? '#10B981' : '#FB7185')
              : '#9CA3AF'

          return (
            <motion.div key={insight.id} variants={cardVariant} className="flex flex-col h-full">
              <div className="glass-card p-5 h-full flex flex-col">
                {/* Top row: icon + trend badge */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="p-2 rounded-xl"
                    style={{ background: `${severityColor}15` }}
                  >
                    <span style={{ color: severityColor, display: 'flex' }}>
                      <IconComponent size={18} />
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: `${trendBadgeColor}15`, color: trendBadgeColor }}
                  >
                    <TrendIcon size={12} />
                    <span className="font-mono tabular-nums text-[11px]">{insight.trendValue}</span>
                  </div>
                </div>

                {/* Metric */}
                <p
                  className="font-mono tabular-nums text-3xl font-bold mb-0.5"
                  style={{ color: severityColor }}
                >
                  {insight.metric}
                </p>
                <p className="text-xs text-secondary mb-3">{insight.metricLabel}</p>

                {/* Divider */}
                <div className="border-t border-white/5 my-3" />

                {/* Title + interpretation */}
                <h4 className="text-sm font-semibold text-primary mb-1.5">{insight.title}</h4>
                <p className="text-xs text-secondary leading-relaxed flex-1">
                  {insight.interpretation}
                </p>

                {/* Action pill */}
                <div className="mt-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-secondary">
                    <Lightbulb size={11} className="text-amber-400 shrink-0" />
                    <span className="leading-snug">{insight.action}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
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
          <h3 className="text-lg font-semibold text-primary mb-1">Category Distribution</h3>
          <p className="text-xs text-secondary uppercase tracking-widest mb-6">
            Expense breakdown by category
          </p>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_120px_1fr_60px] gap-4 mb-3 px-1">
            <span className="text-[10px] uppercase tracking-widest text-secondary font-medium">
              Category
            </span>
            <span className="text-[10px] uppercase tracking-widest text-secondary font-medium">
              Total Spent
            </span>
            <span className="text-[10px] uppercase tracking-widest text-secondary font-medium">
            </span>
            <span className="text-[10px] uppercase tracking-widest text-secondary font-medium text-right">
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
                  <span className="text-sm text-secondary">{cat.category}</span>
                </div>

                {/* Total */}
                <span className="font-mono text-sm text-primary font-medium">
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
                <span className="font-mono text-xs text-secondary text-right">
                  {cat.percentage}%
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Right — Insights Alerts */}
        <div className="space-y-4">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Insights Alerts</h3>

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
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(244,63,94,0.1)' }}>
                      {i === 0 ? (
                        <Zap size={18} className="text-rose-400" />
                      ) : (
                        <TrendingDown size={18} className="text-rose-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-primary">
                          Unusual Spend
                        </h4>
                        <span className="text-[10px] tabular-nums font-bold px-1.5 py-0.5 rounded text-rose-400"
                          style={{ fontFamily: 'JetBrains Mono', background: 'rgba(244,63,94,0.1)' }}>
                          {anomaly.multiplier}x
                        </span>
                      </div>
                      <p className="text-xs text-secondary leading-relaxed">
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
            <h4 className="text-sm font-semibold text-primary mb-1.5">
              Optimize Your Spending
            </h4>
            <p className="text-xs text-secondary leading-relaxed mb-3">
              By reducing your <span className="text-secondary">{insights.topCategory}</span> spending by 20%,
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
            <h3 className="text-lg font-semibold text-primary">Spending Activity</h3>
            <p className="text-xs text-secondary uppercase tracking-widest mt-0.5">
              Last 6 weeks
            </p>
          </div>
          <SpendingHeatmap transactions={transactions} />
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
