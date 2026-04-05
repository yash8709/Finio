import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { NumberTicker } from '../components/ui/NumberTicker'
import { HealthScoreGauge } from '../components/ui/HealthScoreGauge'
import { SmartBanner } from '../components/ui/SmartBanner'
import { AreaChart } from '../components/charts/AreaChart'
import { DonutChart } from '../components/charts/DonutChart'
import { useInsights } from '../hooks/useInsights'
import { formatINR } from '../utils/formatters'
import { computeHealthScore } from '../utils/insights'
import { getBannerState } from '../utils/getBannerState'

import { useTransactionStore } from '../store/transactionStore'
import { startOfMonth, endOfMonth, isWithinInterval, format } from 'date-fns'

// ─── Animation variants ─────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -5, transition: { duration: 0.15 } },
}

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } },
}

function getCategoryColor(category: string): 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate' {
  const c = category.toLowerCase()
  if (c.includes('food') || c.includes('dining')) return 'amber'
  if (c.includes('transport')) return 'indigo'
  if (c.includes('health')) return 'emerald'
  if (c.includes('shopping')) return 'rose'
  return 'slate'
}

// ─── Dashboard Page ──────────────────────────────────────
export function Dashboard() {
  const insights = useInsights()
  const transactions = useTransactionStore((s) => s.transactions)
  const navigate = useNavigate()

  // ─── Health Score ──────────────────────────────────────
  const healthScore = useMemo(() => computeHealthScore(transactions), [transactions])

  // ─── Smart Banner ─────────────────────────────────────
  const bannerState = useMemo(
    () => getBannerState(
      transactions,
      insights.anomalies,
      insights.topCategoryPercentage,
      insights.topCategory,
    ),
    [transactions, insights.anomalies, insights.topCategoryPercentage, insights.topCategory],
  )

  // ─── Data Computation (PRIORITY 2 FIX) ─────────────────
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const currentMonthTxns = transactions.filter(t => {
    const txDate = new Date(t.date)
    return isWithinInterval(txDate, {
      start: monthStart,
      end: monthEnd
    })
  })

  const totalBalance = transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount
  }, 0)

  const monthlyIncome = currentMonthTxns
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpenses = currentMonthTxns
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const savingsRate = monthlyIncome > 0 
    ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)
    : 0

  // Previous month comparison for % change:
  const prevMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1))
  const prevMonthEnd = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1))
  
  const prevMonthTxns = transactions.filter(t => {
    const txDate = new Date(t.date)
    return isWithinInterval(txDate, {
      start: prevMonthStart,
      end: prevMonthEnd
    })
  })
  
  const prevIncome = prevMonthTxns
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
    
  const prevExpenses = prevMonthTxns
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const prevBalance = prevMonthTxns.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount
  }, 0)

  const balanceChange = prevBalance !== 0
    ? Number((((totalBalance - prevBalance) / Math.abs(prevBalance)) * 100).toFixed(1))
    : monthlyIncome > 0 ? 100.0 : 0.0

  const incomeChange = prevIncome > 0 
    ? Number(((monthlyIncome - prevIncome) / prevIncome * 100).toFixed(1))
    : monthlyIncome > 0 ? 100.0 : 0.0
    
  const expenseChange = prevExpenses > 0
    ? Number(((monthlyExpenses - prevExpenses) / prevExpenses * 100).toFixed(1))
    : monthlyExpenses > 0 ? 100.0 : 0.0

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [transactions])

  const card1 = (
    <div className="glass-card p-5 relative overflow-hidden h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1" style={{fontFamily:'Sora'}}>TOTAL BALANCE</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary tabular-nums" style={{fontFamily:'JetBrains Mono'}}>
                ₹<NumberTicker value={totalBalance} />
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl" style={{background:'rgba(16,185,129,0.1)'}}>
            <WalletIcon className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
          style={{ background: balanceChange >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(251,113,133,0.12)', color: balanceChange >= 0 ? '#10B981' : '#FB7185' }}>
          {balanceChange >= 0 ? '↑' : '↓'}{Math.abs(balanceChange)}%
        </span>
        <span className="text-xs text-gray-500">vs last month</span>
      </div>
    </div>
  )

  const card2 = (
    <div className="glass-card p-5 relative overflow-hidden h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #818CF8 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1" style={{fontFamily:'Sora'}}>MONTHLY INCOME</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary tabular-nums" style={{fontFamily:'JetBrains Mono'}}>
                ₹<NumberTicker value={monthlyIncome} />
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl" style={{background:'rgba(129,140,248,0.1)'}}>
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
          style={{ background: incomeChange >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(251,113,133,0.12)', color: incomeChange >= 0 ? '#10B981' : '#FB7185' }}>
          {incomeChange >= 0 ? '↑' : '↓'}{Math.abs(incomeChange)}%
        </span>
        <span className="text-xs text-gray-500">Active salary flow</span>
      </div>
    </div>
  )

  const card3 = (
    <div className="glass-card p-5 relative overflow-hidden h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #FB7185 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1" style={{fontFamily:'Sora'}}>MONTHLY EXPENSES</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary tabular-nums" style={{fontFamily:'JetBrains Mono'}}>
                ₹<NumberTicker value={monthlyExpenses} />
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl" style={{background:'rgba(251,113,133,0.1)'}}>
            <TrendingDown className="w-5 h-5 text-rose-400" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
          style={{ background: expenseChange <= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(251,113,133,0.12)', color: expenseChange <= 0 ? '#10B981' : '#FB7185' }}>
          {expenseChange >= 0 ? '↑' : '↓'}{Math.abs(expenseChange)}%
        </span>
        <span className="text-xs text-gray-500">Controlled outflow</span>
      </div>
    </div>
  )

  const card4 = (
    <div className="glass-card p-5 relative overflow-hidden h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1" style={{fontFamily:'Sora'}}>SAVINGS RATE</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary tabular-nums" style={{fontFamily:'JetBrains Mono'}}>
                <NumberTicker value={savingsRate} />%
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl" style={{background:'rgba(245,158,11,0.1)'}}>
            <PiggyBank className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>
      <div className="mt-auto pt-4">
        <div className="h-1.5 rounded-full" style={{background:'rgba(255,255,255,0.08)'}}>
          <div className="h-full rounded-full bg-amber-400 transition-all duration-700"
            style={{width: `${savingsRate}%`}} />
        </div>
      </div>
    </div>
  )

  return (
    <motion.div
      className="space-y-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* ─── Smart Banner ────────────────────────────── */}
      <SmartBanner banner={bannerState} />

      {/* ─── Summary Cards ──────────────────────────── */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 }}
        }}
        initial="hidden"
        animate="show"
      >
        {[card1, card2, card3, card4].map((card, i) => (
          <motion.div key={i} className="flex flex-col h-full" variants={{
            hidden: { opacity: 0, y: 24 },
            show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
          }}>
            {card}
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Health Score Card (5th card) ────────────── */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${healthScore.color} 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />

          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Left — Label + Gauge */}
            <div className="flex flex-col items-center lg:items-start gap-3 lg:min-w-[200px]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl" style={{ background: `${healthScore.color}1A` }}>
                  <ShieldCheck className="w-5 h-5" style={{ color: healthScore.color }} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500" style={{ fontFamily: 'Sora' }}>Health Score</p>
                  <p className="text-[10px] mt-0.5" style={{ color: healthScore.color, fontFamily: 'Sora' }}>
                    Grade {healthScore.grade} · {healthScore.label}
                  </p>
                </div>
              </div>
              <HealthScoreGauge data={healthScore} />
            </div>

            {/* Right — Breakdown Pills */}
            <div className="flex-1 w-full">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3" style={{ fontFamily: 'Sora' }}>Score Breakdown</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  { label: 'Savings', score: healthScore.breakdown.savingsRate.score, max: healthScore.breakdown.savingsRate.max, color: '#10B981' },
                  { label: 'Control', score: healthScore.breakdown.spendingControl.score, max: healthScore.breakdown.spendingControl.max, color: '#818CF8' },
                  { label: 'Balance', score: healthScore.breakdown.categoryBalance.score, max: healthScore.breakdown.categoryBalance.max, color: '#F59E0B' },
                  { label: 'Streak', score: healthScore.breakdown.consistency.score, max: healthScore.breakdown.consistency.max, color: '#34D399' },
                ].map((pill) => (
                  <div
                    key={pill.label}
                    className="rounded-xl px-3 py-2.5 text-center"
                    style={{ background: `${pill.color}15`, border: `1px solid ${pill.color}20` }}
                  >
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: `${pill.color}99`, fontFamily: 'Sora' }}>{pill.label}</p>
                    <p className="font-mono tabular-nums text-sm font-bold" style={{ color: pill.color }}>
                      {pill.score}<span className="text-secondary font-normal">/{pill.max}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Charts Row ─────────────────────── */}
      <motion.div
        className="flex flex-col lg:flex-row gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="flex-[3]">
          <AreaChart
            data={insights.monthlyData}
            title="Balance Trend"
            subtitle="Financial trajectory overview"
          />
        </div>
        <div className="flex-[2]">
          <DonutChart
            data={insights.categoryBreakdown}
            title="Spending Breakdown"
            subtitle="Category distribution"
          />
        </div>
      </motion.div>

      {/* ─── Recent Activity ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
      >
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-primary">Recent Activity</h3>
              <p className="text-xs text-secondary uppercase tracking-widest mt-0.5">
                Latest wallet transactions
              </p>
            </div>
            <Link
              to="/transactions"
              className="flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-primary bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <motion.div
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 }}
            }}
            initial="hidden"
            animate="show"
          >
            {recentTransactions.map((t) => (
              <motion.div
                key={t.id}
                variants={rowVariants}
                className="flex items-center gap-3 py-3 px-1 rounded-xl cursor-pointer border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group"
                onClick={() => navigate('/transactions')}
              >
                <Avatar name={t.merchant} size="md" />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">{t.merchant}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge label={t.category.split(' ')[0]} color={getCategoryColor(t.category)} />
                    <span className="text-xs text-gray-500">
                      {format(new Date(t.date), 'd MMM · h:mm a')}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums"
                    style={{ fontFamily:'JetBrains Mono', color: t.type === 'income' ? '#10B981' : '#FB7185' }}>
                    {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
