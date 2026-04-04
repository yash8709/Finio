import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import type { Transaction, BannerState, AnomalyData } from '../types'
import { formatINR } from './formatters'

/**
 * Determines which contextual banner to show based on financial data.
 * Priority: DANGER → WARNING (anomaly) → WARNING (category) → SUCCESS → INFO
 */
export function getBannerState(
  transactions: Transaction[],
  anomalies: AnomalyData[],
  topCategoryPercentage: number,
  topCategory: string,
): BannerState {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const currentMonthTxns = transactions.filter((t) =>
    isWithinInterval(t.date, { start: monthStart, end: monthEnd }),
  )

  const monthlyIncome = currentMonthTxns
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpenses = currentMonthTxns
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const savingsRate = monthlyIncome > 0
    ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
    : 0

  const savings = monthlyIncome - monthlyExpenses
  const currentMonth = format(now, 'MMMM')

  // ─── 1. DANGER — expenses > income ────────────────────
  if (monthlyExpenses > monthlyIncome && monthlyIncome > 0) {
    const diff = monthlyExpenses - monthlyIncome
    return {
      type: 'danger',
      icon: 'TrendingDown',
      headline: "You're overspending this month",
      subline: `Expenses exceed income by ${formatINR(diff)} — review your top categories`,
      color: '#FB7185',
      bgColor: 'rgba(251,113,133,0.08)',
      borderColor: 'rgba(251,113,133,0.30)',
      dismissible: true,
    }
  }

  // ─── 2. WARNING — anomaly detected ────────────────────
  if (anomalies.length > 0) {
    const top = anomalies[0]
    return {
      type: 'warning',
      icon: 'AlertTriangle',
      headline: `Unusual spending detected in ${top.transaction.category}`,
      subline: `${top.transaction.merchant} was ${formatINR(top.transaction.amount)} — ${top.multiplier}x your typical ${top.transaction.category} spend`,
      color: '#F59E0B',
      bgColor: 'rgba(245,158,11,0.08)',
      borderColor: 'rgba(245,158,11,0.30)',
      dismissible: true,
    }
  }

  // ─── 3. WARNING — top category > 45% ──────────────────
  if (topCategoryPercentage > 45) {
    return {
      type: 'warning',
      icon: 'PieChart',
      headline: `${topCategory} is consuming ${topCategoryPercentage}% of your budget`,
      subline: "Consider setting a limit — this is above the recommended 40%",
      color: '#F59E0B',
      bgColor: 'rgba(245,158,11,0.08)',
      borderColor: 'rgba(245,158,11,0.30)',
      dismissible: true,
    }
  }

  // ─── 4. SUCCESS — savings rate > 25% ──────────────────
  if (savingsRate > 25) {
    const multiplier = (savingsRate / 20).toFixed(1)
    return {
      type: 'success',
      icon: 'TrendingUp',
      headline: `Strong financial month! You're saving ${Math.round(savingsRate)}%`,
      subline: `That's ${formatINR(savings)} saved — ${multiplier}x above the recommended 20% benchmark`,
      color: '#10B981',
      bgColor: 'rgba(16,185,129,0.08)',
      borderColor: 'rgba(16,185,129,0.30)',
      dismissible: true,
    }
  }

  // ─── 5. INFO — default balanced state ─────────────────
  return {
    type: 'info',
    icon: 'BarChart2',
    headline: `Here's your financial snapshot for ${currentMonth}`,
    subline: `${formatINR(monthlyIncome)} earned · ${formatINR(monthlyExpenses)} spent · ${formatINR(Math.max(savings, 0))} saved`,
    color: '#818CF8',
    bgColor: 'rgba(129,140,248,0.08)',
    borderColor: 'rgba(129,140,248,0.30)',
    dismissible: true,
  }
}
