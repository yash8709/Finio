import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import type {
  Transaction,
  InsightData,
  AnomalyData,
  CategoryBreakdown,
  MonthlyData,
  CategoryType,
} from '../types'

/**
 * Pure function: computes all insights from a transaction array.
 * No React, no Zustand — just data in, data out.
 */
export function computeInsights(transactions: Transaction[]): InsightData {
  const now = new Date()

  // ─── 1. Category Breakdown (expenses only) ──────────────
  const expenseTransactions = transactions.filter((t) => t.type === 'expense')
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)

  const categoryTotals = new Map<CategoryType, number>()
  for (const t of expenseTransactions) {
    const current = categoryTotals.get(t.category) || 0
    categoryTotals.set(t.category, current + t.amount)
  }

  const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryTotals.entries())
    .map(([category, total]) => ({
      category,
      total,
      percentage: totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)

  // ─── 2. Top spending category ───────────────────────────
  const topCat = categoryBreakdown[0] || {
    category: 'Food & Dining' as CategoryType,
    total: 0,
    percentage: 0,
  }

  // ─── 3. Monthly data for last 6 months ──────────────────
  const monthlyData: MonthlyData[] = []

  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i)
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)

    const monthTransactions = transactions.filter((t) =>
      isWithinInterval(t.date, { start: monthStart, end: monthEnd }),
    )

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    monthlyData.push({
      month: format(monthDate, 'MMM'),
      income,
      expenses,
      balance: income - expenses,
    })
  }

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalBalance = totalIncome - totalExpenses

  const recentTransactions = transactions.slice(0, 5)

  const SAVINGS_GOAL = 50000
  const savingsGoalProgress = Math.round((totalBalance / SAVINGS_GOAL) * 100)

  // ─── 5. Runway calculation ──────────────────────────────
  const monthsWithData = monthlyData.filter((m) => m.expenses > 0).length
  const avgMonthlyBurn = monthsWithData > 0
    ? monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthsWithData
    : 1

  const runwayMonths = avgMonthlyBurn > 0
    ? Math.round(totalBalance / avgMonthlyBurn)
    : 0

  // ─── 5. Surplus forecast (annual projection) ───────────
  const avgMonthlyIncome = monthsWithData > 0
    ? monthlyData.reduce((sum, m) => sum + m.income, 0) / monthsWithData
    : 0

  const avgMonthlySavings = avgMonthlyIncome - avgMonthlyBurn
  const surplusForecast = Math.round(avgMonthlySavings * 12)

  // ─── 6. Best month (highest net savings) ────────────────
  const bestMonthData = [...monthlyData].sort((a, b) => b.balance - a.balance)[0]
  const bestMonth = bestMonthData
    ? bestMonthData.month
    : format(now, 'MMM')
  const bestMonthSavings = bestMonthData ? bestMonthData.balance : 0

  // ─── 7. Anomaly detection (placeholder) ─────────────────
  const anomalies: AnomalyData[] = []

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    monthlyData,
    categoryBreakdown,
    recentTransactions,
    savingsGoalProgress,
    topCategory: topCat.category,
    topCategoryAmount: topCat.total,
    topCategoryPercentage: topCat.percentage,
    runwayMonths,
    surplusForecast,
    bestMonth,
    bestMonthSavings,
    anomalies,
  }
}
