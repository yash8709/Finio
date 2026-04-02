export interface Transaction {
  id: string
  date: Date
  amount: number
  category: CategoryType
  type: 'income' | 'expense'
  merchant: string
  description: string
}

export type CategoryType =
  | 'Food & Dining'
  | 'Transport'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills & Utilities'
  | 'Health'
  | 'Subscriptions'
  | 'Salary'
  | 'Freelance'

export type RoleType = 'admin' | 'viewer'

export type SortField = 'date' | 'amount'
export type SortOrder = 'asc' | 'desc'

export interface FilterState {
  search: string
  category: CategoryType | 'all'
  type: 'income' | 'expense' | 'all'
  dateFrom: string
  dateTo: string
  sortBy: SortField
  sortOrder: SortOrder
}

export interface MonthlyData {
  month: string
  income: number
  expenses: number
  balance: number
}

export interface InsightData {
  topCategory: CategoryType
  topCategoryAmount: number
  topCategoryPercentage: number
  runwayMonths: number
  surplusForecast: number
  bestMonth: string
  bestMonthSavings: number
  anomalies: AnomalyData[]
  categoryBreakdown: CategoryBreakdown[]
  monthlyData: MonthlyData[]
}

export interface AnomalyData {
  transaction: Transaction
  categoryAverage: number
  multiplier: number
}

export interface CategoryBreakdown {
  category: CategoryType
  total: number
  percentage: number
}
