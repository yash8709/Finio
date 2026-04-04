import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import type {
  Transaction,
  InsightData,
  AnomalyData,
  CategoryBreakdown,
  MonthlyData,
  CategoryType,
  HealthScoreData,
  ActionableInsight,
} from '../types'
import { formatINR } from './formatters'

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

  // ─── 7. Anomaly detection ───────────────────────────────
  const anomalies: AnomalyData[] = []
  const thisMonthStart = startOfMonth(now)
  
  const thisMonthExpensesForAnomalies = expenseTransactions.filter(t => t.date >= thisMonthStart)
  const pastExpenses = expenseTransactions.filter(t => t.date < thisMonthStart)

  const pastCategoryStats = new Map<string, { count: number, total: number }>()
  for (const t of pastExpenses) {
    const stat = pastCategoryStats.get(t.category) || { count: 0, total: 0 }
    stat.count++
    stat.total += t.amount
    pastCategoryStats.set(t.category, stat)
  }

  for (const t of thisMonthExpensesForAnomalies) {
    const stat = pastCategoryStats.get(t.category)
    // require at least 1 past transaction for baseline
    if (stat && stat.count >= 1) { 
      const categoryAverage = stat.total / stat.count
      // if expense is > 2x the category average explicitly
      if (categoryAverage > 500 && t.amount > categoryAverage * 2) {
        anomalies.push({
          transaction: t,
          categoryAverage: Math.round(categoryAverage),
          multiplier: Number((t.amount / categoryAverage).toFixed(1))
        })
      }
    }
  }

  // Sort by severity
  anomalies.sort((a, b) => b.multiplier - a.multiplier)

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

/**
 * Computes a Financial Health Score (0–100) from transaction data.
 * Scoring formula covers four dimensions:
 *   - Savings Rate (40 pts)
 *   - Spending Control (30 pts)
 *   - Category Balance (20 pts)
 *   - Consistency (10 pts)
 */
export function computeHealthScore(transactions: Transaction[]): HealthScoreData {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  // ─── 1. Savings Rate (max 40 pts) ─────────────────────
  const savingsPercent = totalIncome > 0
    ? ((totalIncome - totalExpenses) / totalIncome) * 100
    : -1

  let savingsScore: number
  if (savingsPercent > 30) savingsScore = 40
  else if (savingsPercent >= 20) savingsScore = 30
  else if (savingsPercent >= 10) savingsScore = 20
  else if (savingsPercent >= 0) savingsScore = 10
  else savingsScore = 0

  // ─── 2. Spending Control (max 30 pts) ─────────────────
  const now = new Date()
  const thisMonthStart = startOfMonth(now)
  const thisMonthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  const thisMonthExpenses = transactions
    .filter((t) => t.type === 'expense' && isWithinInterval(t.date, { start: thisMonthStart, end: thisMonthEnd }))
    .reduce((sum, t) => sum + t.amount, 0)

  const lastMonthExpenses = transactions
    .filter((t) => t.type === 'expense' && isWithinInterval(t.date, { start: lastMonthStart, end: lastMonthEnd }))
    .reduce((sum, t) => sum + t.amount, 0)

  const variance = lastMonthExpenses > 0
    ? (Math.abs(thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
    : 0

  let controlScore: number
  if (variance < 5) controlScore = 30
  else if (variance <= 15) controlScore = 22
  else if (variance <= 30) controlScore = 14
  else controlScore = 5

  // ─── 3. Category Balance (max 20 pts) ─────────────────
  const expenseTransactions = transactions.filter((t) => t.type === 'expense')
  const categoryTotals = new Map<string, number>()
  for (const t of expenseTransactions) {
    categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + t.amount)
  }

  const topCategoryExpenses = Math.max(...Array.from(categoryTotals.values()), 0)
  const topCategoryShare = totalExpenses > 0
    ? (topCategoryExpenses / totalExpenses) * 100
    : 0

  let balanceScore: number
  if (topCategoryShare < 25) balanceScore = 20
  else if (topCategoryShare <= 35) balanceScore = 14
  else if (topCategoryShare <= 45) balanceScore = 8
  else balanceScore = 2

  // ─── 4. Consistency (max 10 pts) ──────────────────────
  // Count consecutive positive-balance months going backwards
  const monthlyBalances: number[] = []
  for (let i = 0; i < 6; i++) {
    const mStart = startOfMonth(subMonths(now, i))
    const mEnd = endOfMonth(subMonths(now, i))

    const mIncome = transactions
      .filter((t) => t.type === 'income' && isWithinInterval(t.date, { start: mStart, end: mEnd }))
      .reduce((sum, t) => sum + t.amount, 0)

    const mExpenses = transactions
      .filter((t) => t.type === 'expense' && isWithinInterval(t.date, { start: mStart, end: mEnd }))
      .reduce((sum, t) => sum + t.amount, 0)

    monthlyBalances.push(mIncome - mExpenses)
  }

  // Count consecutive positive months from most recent
  let consecutivePositive = 0
  for (const bal of monthlyBalances) {
    if (bal > 0) consecutivePositive++
    else break
  }

  let consistencyScore: number
  if (consecutivePositive >= 3) consistencyScore = 10
  else if (consecutivePositive === 2) consistencyScore = 7
  else if (consecutivePositive === 1) consistencyScore = 4
  else consistencyScore = 0

  // ─── Final Score + Grade ──────────────────────────────
  const score = savingsScore + controlScore + balanceScore + consistencyScore

  let grade: HealthScoreData['grade']
  let label: string
  let color: string

  if (score >= 90) {
    grade = 'A'; label = 'Excellent'; color = '#10B981'
  } else if (score >= 75) {
    grade = 'B'; label = 'Good'; color = '#34D399'
  } else if (score >= 60) {
    grade = 'C'; label = 'Fair'; color = '#F59E0B'
  } else if (score >= 40) {
    grade = 'D'; label = 'Poor'; color = '#FB7185'
  } else {
    grade = 'F'; label = 'Critical'; color = '#EF4444'
  }

  return {
    score,
    grade,
    label,
    color,
    breakdown: {
      savingsRate: { score: savingsScore, max: 40, value: Math.round(Math.max(savingsPercent, 0)) },
      spendingControl: { score: controlScore, max: 30, value: Math.round(variance) },
      categoryBalance: { score: balanceScore, max: 20, value: Math.round(topCategoryShare) },
      consistency: { score: consistencyScore, max: 10, value: consecutivePositive },
    },
  }
}

/**
 * Generates 3 actionable insight cards from computed InsightData.
 * Each insight includes severity, interpretation text with real numbers,
 * and a concrete action suggestion.
 */
export function interpretInsights(data: InsightData): ActionableInsight[] {
  const insights: ActionableInsight[] = []

  // ─── 1. Top Spending Category ─────────────────────────
  const isHighSpend = data.topCategoryPercentage > 40
  const reduction = Math.round(data.topCategoryAmount * 0.2)

  insights.push({
    id: 'top-spending',
    severity: isHighSpend ? 'warning' : 'info',
    icon: 'ShoppingBag',
    title: `${data.topCategory} is your biggest expense`,
    interpretation: `You spent ${formatINR(data.topCategoryAmount)} on ${data.topCategory} — ${data.topCategoryPercentage}% of total expenses. ${isHighSpend ? 'This is unusually high.' : 'This is within range.'}`,
    action: isHighSpend
      ? `Consider reducing ${data.topCategory} by ${formatINR(reduction)} to improve balance`
      : 'Your spending here is healthy',
    metric: formatINR(data.topCategoryAmount),
    metricLabel: `${data.topCategoryPercentage}% of total expenses`,
    trend: isHighSpend ? 'up' : 'neutral',
    trendValue: `${data.topCategoryPercentage}% share`,
  })

  // ─── 2. Savings & Runway ──────────────────────────────
  const monthsWithExpenses = data.monthlyData.filter((m) => m.expenses > 0)
  const avgMonthlyExpenses = monthsWithExpenses.length > 0
    ? Math.round(monthsWithExpenses.reduce((s, m) => s + m.expenses, 0) / monthsWithExpenses.length)
    : 1

  const runway = data.runwayMonths
  const isPositiveRunway = runway > 0

  let runwaySeverity: ActionableInsight['severity']
  if (runway < 3) runwaySeverity = 'danger'
  else if (runway <= 6) runwaySeverity = 'warning'
  else runwaySeverity = 'positive'

  const targetMonthlySave = runway < 6
    ? Math.round((avgMonthlyExpenses * 6 - data.totalBalance) / 12)
    : 0

  insights.push({
    id: 'runway',
    severity: runwaySeverity,
    icon: 'Shield',
    title: isPositiveRunway
      ? `You have ${runway} months of runway`
      : 'Budget deficit detected',
    interpretation: `Based on avg monthly expenses of ${formatINR(avgMonthlyExpenses)}, your current balance covers ${runway} months. ${runway > 6 ? 'Excellent buffer.' : 'Build your emergency fund.'}`,
    action: runway < 6
      ? `Aim to save ${formatINR(Math.max(targetMonthlySave, 0))}/month to reach 6-month safety net`
      : 'Maintain this rate — your emergency fund is healthy',
    metric: `${runway} months`,
    metricLabel: `At ${formatINR(avgMonthlyExpenses)}/mo burn rate`,
    trend: runway > 6 ? 'up' : runway > 0 ? 'neutral' : 'down',
    trendValue: runway > 6 ? 'Strong buffer' : runway > 3 ? 'Moderate' : 'Low runway',
  })

  // ─── 3. Monthly Performance ───────────────────────────
  const currentMonth = data.monthlyData[data.monthlyData.length - 1]
  const currentBalance = currentMonth ? currentMonth.balance : 0
  const diff = currentBalance - data.bestMonthSavings
  const isCurrentBest = currentMonth?.month === data.bestMonth

  insights.push({
    id: 'performance',
    severity: 'positive',
    icon: 'Trophy',
    title: `${data.bestMonth} was your best month`,
    interpretation: `You saved the most in ${data.bestMonth} — ${formatINR(data.bestMonthSavings)} net positive. ${isCurrentBest ? 'You are on track to beat it!' : `This month is ${formatINR(Math.abs(diff))} ${diff >= 0 ? 'ahead of' : 'behind'} that pace.`}`,
    action: `Replicate ${data.bestMonth} habits — identify what you spent less on that month`,
    metric: formatINR(data.bestMonthSavings),
    metricLabel: `Best month net savings`,
    trend: diff >= 0 ? 'up' : 'down',
    trendValue: isCurrentBest ? 'Current best!' : `${formatINR(Math.abs(diff))} ${diff >= 0 ? 'ahead' : 'behind'}`,
  })

  return insights
}
