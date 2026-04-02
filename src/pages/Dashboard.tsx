import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowRight,
} from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { NumberTicker } from '../components/ui/NumberTicker'
import { AreaChart } from '../components/charts/AreaChart'
import { DonutChart } from '../components/charts/DonutChart'
import { useInsights } from '../hooks/useInsights'
import { useTransactionStore } from '../store/transactionStore'
import { formatINR, formatDate } from '../utils/formatters'
import type { Transaction } from '../types'

// ─── Animation variants ─────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.07,
    },
  },
}

const cardVariant = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const listItemVariant = {
  initial: { opacity: 0, x: -8 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
}

// ─── Summary Card Sub-Component ──────────────────────────
interface SummaryCardProps {
  label: string
  amount: number
  change: string
  changePositive: boolean
  icon: React.ElementType
  iconBg: string
  iconColor: string
  subtitle?: string
  progressBar?: { value: number; color: string }
  isCurrency?: boolean
}

function SummaryCard({
  label,
  amount,
  change,
  changePositive,
  icon: Icon,
  iconBg,
  iconColor,
  subtitle,
  progressBar,
  isCurrency = true,
}: SummaryCardProps) {
  return (
    <GlassCard hoverable className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={20} className={iconColor} />
        </div>
        <span
          className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${
            changePositive
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-rose-500/10 text-rose-400'
          }`}
        >
          {change}
        </span>
      </div>

      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">{label}</p>
      <p className="text-2xl font-mono font-bold text-white">
        {isCurrency ? (
          <NumberTicker value={amount} formatter={(v) => formatINR(v)} />
        ) : (
          <NumberTicker value={amount} suffix="%" />
        )}
      </p>

      {subtitle && (
        <p className="text-xs text-white/30 mt-1">{subtitle}</p>
      )}

      {progressBar && (
        <div className="mt-3">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressBar.value, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              style={{ backgroundColor: progressBar.color }}
            />
          </div>
        </div>
      )}
    </GlassCard>
  )
}

// ─── Transaction Row Sub-Component ───────────────────────
function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === 'income'

  return (
    <div className="flex items-center gap-4 py-3 group hover:bg-white/[0.02] rounded-xl px-2 -mx-2 transition-colors duration-150">
      <Avatar name={transaction.merchant} size="md" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{transaction.merchant}</p>
        <p className="text-xs text-white/30 mt-0.5">
          {formatDate(transaction.date, 'dd MMM, yyyy')} • {formatDate(transaction.date, 'hh:mm a')}
        </p>
      </div>

      <Badge
        label={transaction.category.split(' ')[0]}
        category={transaction.category}
        size="sm"
      />

      <p className={`font-mono font-semibold text-sm min-w-[100px] text-right ${
        isIncome ? 'text-emerald-400' : 'text-white'
      }`}>
        {isIncome ? '+' : '-'} {formatINR(transaction.amount)}
      </p>
    </div>
  )
}

// ─── Dashboard Page ──────────────────────────────────────
export function Dashboard() {
  const insights = useInsights()
  const transactions = useTransactionStore((s) => s.transactions)

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
  }, [transactions])

  // ─── FIXED: Compute monthly data directly from transactions ───
  // Instead of relying on sorted monthlyData array position,
  // directly filter transactions for current and previous months.
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Previous month date
  const prevDate = new Date(currentYear, currentMonth - 1, 1)
  const prevMonth = prevDate.getMonth()
  const prevYear = prevDate.getFullYear()

  const totalBalance = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    return income - expenses
  }, [transactions])

  // Current month income/expenses — directly filter by real calendar month
  const monthlyIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income' && t.date.getMonth() === currentMonth && t.date.getFullYear() === currentYear)
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions, currentMonth, currentYear])

  const monthlyExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense' && t.date.getMonth() === currentMonth && t.date.getFullYear() === currentYear)
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions, currentMonth, currentYear])

  // Previous month for comparison
  const prevMonthIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income' && t.date.getMonth() === prevMonth && t.date.getFullYear() === prevYear)
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions, prevMonth, prevYear])

  const prevMonthExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense' && t.date.getMonth() === prevMonth && t.date.getFullYear() === prevYear)
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions, prevMonth, prevYear])

  const prevMonthBalance = prevMonthIncome - prevMonthExpenses

  const savingsRate = monthlyIncome > 0
    ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)
    : 0

  // Change percentages
  const balanceChange = prevMonthBalance !== 0
    ? (((totalBalance - prevMonthBalance) / Math.abs(prevMonthBalance)) * 100).toFixed(1)
    : monthlyIncome > 0 ? '+100.0' : '0.0'

  const incomeChange = prevMonthIncome > 0
    ? (((monthlyIncome - prevMonthIncome) / prevMonthIncome) * 100).toFixed(1)
    : monthlyIncome > 0 ? '+100.0' : '0.0'

  const expenseChange = prevMonthExpenses > 0
    ? (((monthlyExpenses - prevMonthExpenses) / prevMonthExpenses) * 100).toFixed(1)
    : monthlyExpenses > 0 ? '+100.0' : '0.0'

  return (
    <motion.div
      className="space-y-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* ─── Summary Cards ──────────────────────────── */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={cardVariant}>
          <SummaryCard
            label="Total Balance"
            amount={totalBalance}
            change={`${Number(balanceChange) >= 0 ? '+' : ''}${balanceChange}%`}
            changePositive={Number(balanceChange) >= 0}
            icon={Wallet}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-400"
            subtitle="vs last month"
          />
        </motion.div>

        <motion.div variants={cardVariant}>
          <SummaryCard
            label="Monthly Income"
            amount={monthlyIncome}
            change={`${Number(incomeChange) >= 0 ? '+' : ''}${incomeChange}%`}
            changePositive={Number(incomeChange) >= 0}
            icon={TrendingUp}
            iconBg="bg-indigo-500/10"
            iconColor="text-indigo-400"
            subtitle="Active salary flow"
          />
        </motion.div>

        <motion.div variants={cardVariant}>
          <SummaryCard
            label="Monthly Expenses"
            amount={monthlyExpenses}
            change={`${Number(expenseChange) >= 0 ? '+' : ''}${expenseChange}%`}
            changePositive={Number(expenseChange) <= 0}
            icon={TrendingDown}
            iconBg="bg-rose-500/10"
            iconColor="text-rose-400"
            subtitle="Controlled outflow"
          />
        </motion.div>

        <motion.div variants={cardVariant}>
          <SummaryCard
            label="Savings Rate"
            amount={savingsRate}
            change={savingsRate > 0 ? `+${savingsRate}%` : '0%'}
            changePositive={savingsRate > 0}
            icon={PiggyBank}
            iconBg="bg-amber-500/10"
            iconColor="text-amber-400"
            isCurrency={false}
            progressBar={{
              value: savingsRate,
              color: savingsRate > 30 ? '#10B981' : savingsRate > 15 ? '#F59E0B' : '#FB7185',
            }}
          />
        </motion.div>
      </motion.div>

      {/* ─── Charts Row (60/40) ─────────────────────── */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <AreaChart
          data={insights.monthlyData}
          title="Balance Trend"
          subtitle="Financial trajectory overview"
        />
        <DonutChart
          data={insights.categoryBreakdown}
          title="Spending Breakdown"
          subtitle="Category distribution"
        />
      </motion.div>

      {/* ─── Recent Activity ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <p className="text-xs text-white/30 uppercase tracking-widest mt-0.5">
                Latest wallet transactions
              </p>
            </div>
            <Link
              to="/transactions"
              className="
                flex items-center gap-1.5 text-sm font-medium
                text-white/40 hover:text-white
                bg-white/5 hover:bg-white/10
                border border-white/10 hover:border-white/20
                px-3 py-1.5 rounded-lg
                transition-all duration-200
              "
            >
              View All
              <ArrowRight size={14} />
            </Link>
          </div>

          <motion.div
            className="space-y-1"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {recentTransactions.map((transaction) => (
              <motion.div key={transaction.id} variants={listItemVariant}>
                <TransactionRow transaction={transaction} />
              </motion.div>
            ))}
          </motion.div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
