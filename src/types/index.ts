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
}

export interface MonthlyData {
  month: string
  income: number
  expenses: number
  balance: number
}

export interface InsightData {
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
