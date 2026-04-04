export interface Transaction {
  id: string
  date: Date
  amount: number
  category: Category
  type: TransactionType
  merchant: string
  description: string
}

export type Category =
  | 'Food & Dining'
  | 'Transport'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills & Utilities'
  | 'Health'
  | 'Subscriptions'
  | 'Salary'
  | 'Freelance'
  | 'Other'

export type TransactionType = 'income' | 'expense'

export type RoleType = 'admin' | 'viewer'

export type SortField = 'date' | 'amount' | 'merchant'
export type SortOrder = 'asc' | 'desc'

export interface FilterState {
  search: string
  category: Category | 'all'
  type: 'income' | 'expense' | 'all'
  dateFrom: string
  dateTo: string
  sortBy: SortField
  sortOrder: SortOrder
  minAmount: number
}

export interface MonthlyData {
  month: string
  income: number
  expenses: number
  balance: number
}

// Alias used by insights.ts
export type CategoryType = Category

export interface InsightData {
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  topCategory: Category
  topCategoryAmount: number
  topCategoryPercentage: number
  runwayMonths: number
  surplusForecast: number
  bestMonth: string
  bestMonthSavings: number
  anomalies: AnomalyData[]
  categoryBreakdown: CategoryBreakdown[]
  monthlyData: MonthlyData[]
  recentTransactions: Transaction[]
  savingsGoalProgress: number
}

export interface AnomalyData {
  transaction: Transaction
  categoryAverage: number
  multiplier: number
}

export interface CategoryBreakdown {
  category: Category
  total: number
  percentage: number
}

// ─── Health Score Types ──────────────────────────────────

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F'

export interface HealthScoreBreakdownItem {
  score: number
  max: number
  value: number
}

export interface HealthScoreData {
  score: number
  grade: HealthGrade
  label: string
  color: string
  breakdown: {
    savingsRate: HealthScoreBreakdownItem
    spendingControl: HealthScoreBreakdownItem
    categoryBalance: HealthScoreBreakdownItem
    consistency: HealthScoreBreakdownItem
  }
}

// ─── Smart Banner Types ─────────────────────────────────

export type BannerType = 'danger' | 'warning' | 'success' | 'info'

export interface BannerState {
  type: BannerType
  icon: string
  headline: string
  subline: string
  color: string
  bgColor: string
  borderColor: string
  dismissible: boolean
}

// ─── Actionable Insight Types ───────────────────────────

export type InsightSeverity = 'positive' | 'warning' | 'danger' | 'info'
export type InsightTrend = 'up' | 'down' | 'neutral'

export interface ActionableInsight {
  id: string
  severity: InsightSeverity
  icon: string
  title: string
  interpretation: string
  action: string
  metric: string
  metricLabel: string
  trend: InsightTrend
  trendValue: string
}
