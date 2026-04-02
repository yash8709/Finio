import { faker } from '@faker-js/faker'
import type { Transaction, CategoryType } from '../types'

// ─── Seed for deterministic data ─────────────────────────
faker.seed(42)

// ─── Merchant pools per category ─────────────────────────
const EXPENSE_MERCHANTS: Record<string, string[]> = {
  'Food & Dining': [
    'Swiggy', 'Zomato', 'Starbucks Coffee', 'Dominos Pizza',
    'McDonald\'s', 'Haldiram\'s', 'BigBasket', 'DMart',
    'Blinkit Groceries', 'Chai Point',
  ],
  'Transport': [
    'Ola', 'Uber India', 'Rapido', 'Metro Card Recharge',
    'Indian Oil Petrol', 'HP Petrol Pump', 'IRCTC Booking',
    'BluSmart',
  ],
  'Entertainment': [
    'BookMyShow', 'PVR Cinemas', 'Netflix', 'Disney+ Hotstar',
    'YouTube Premium', 'Sony LIV', 'Spotify Premium',
  ],
  'Shopping': [
    'Amazon India', 'Flipkart', 'Myntra', 'Ajio',
    'Apple Store BKC', 'Croma Electronics', 'Nykaa',
    'Reliance Digital',
  ],
  'Bills & Utilities': [
    'Airtel Recharge', 'Jio Recharge', 'Tata Power Bill',
    'Mahanagar Gas', 'BSNL Broadband', 'Mumbai Municipal Tax',
    'Society Maintenance',
  ],
  'Health': [
    'Apollo Pharmacy', 'PharmEasy', 'Practo Consultation',
    'Max Healthcare', 'Cult.fit Membership', 'Lenskart',
  ],
  'Subscriptions': [
    'Netflix', 'Spotify', 'Amazon Prime', 'iCloud Storage',
    'ChatGPT Plus', 'Notion Pro', 'Figma Pro', 'GitHub Pro',
  ],
}

const INCOME_MERCHANTS: Record<string, string[]> = {
  'Salary': [
    'HDFC Salary Credit', 'ICICI Salary Credit',
    'SBI Salary Transfer', 'Axis Bank Salary',
  ],
  'Freelance': [
    'Freelance Project', 'Upwork Payment', 'Fiverr Earnings',
    'Contract Payment', 'Consulting Fee', 'Design Project',
  ],
}

// ─── Amount ranges per category (INR) ────────────────────
const EXPENSE_RANGES: Record<string, [number, number]> = {
  'Food & Dining': [200, 3000],
  'Transport': [50, 2000],
  'Entertainment': [500, 5000],
  'Shopping': [500, 15000],
  'Bills & Utilities': [1000, 8000],
  'Health': [500, 10000],
  'Subscriptions': [199, 2000],
}

const INCOME_RANGES: Record<string, [number, number]> = {
  'Salary': [40000, 120000],
  'Freelance': [5000, 50000],
}

// ─── Description templates ───────────────────────────────
const EXPENSE_DESCRIPTIONS: Record<string, string[]> = {
  'Food & Dining': [
    'Lunch order', 'Dinner delivery', 'Coffee and snack',
    'Grocery shopping', 'Weekend brunch', 'Quick-commerce order',
  ],
  'Transport': [
    'Cab to office', 'Airport transfer', 'Daily commute',
    'Weekend ride', 'Train booking', 'Fuel refill',
  ],
  'Entertainment': [
    'Movie tickets', 'Monthly subscription', 'Concert booking',
    'Streaming service renewal', 'Gaming purchase',
  ],
  'Shopping': [
    'Online shopping', 'Electronics purchase', 'Clothing order',
    'Gadget accessory', 'Home decor item', 'Festival shopping',
  ],
  'Bills & Utilities': [
    'Monthly recharge', 'Electricity bill', 'Gas bill payment',
    'Internet bill', 'Municipal tax', 'Maintenance charges',
  ],
  'Health': [
    'Medicine purchase', 'Doctor consultation', 'Health checkup',
    'Gym membership', 'Eye care', 'Supplement order',
  ],
  'Subscriptions': [
    'Monthly plan renewal', 'Annual subscription', 'Cloud storage',
    'Productivity tool', 'AI assistant subscription',
  ],
}

const INCOME_DESCRIPTIONS: Record<string, string[]> = {
  'Salary': [
    'Monthly salary credit', 'Salary deposit', 'Pay day transfer',
  ],
  'Freelance': [
    'Project milestone payment', 'Freelance invoice cleared',
    'Consulting retainer fee', 'Design project final payment',
  ],
}

// ─── Expense categories pool ─────────────────────────────
const EXPENSE_CATEGORIES: CategoryType[] = [
  'Food & Dining', 'Transport', 'Entertainment',
  'Shopping', 'Bills & Utilities', 'Health', 'Subscriptions',
]

const INCOME_CATEGORIES: CategoryType[] = ['Salary', 'Freelance']

// ─── Generator ───────────────────────────────────────────
function generateTransaction(
  index: number,
  startDate: Date,
  endDate: Date,
  forceType?: 'income' | 'expense',
  forceCategory?: CategoryType,
  forceAmountMultiplier?: number,
): Transaction {
  const isIncome = forceType
    ? forceType === 'income'
    : index % 10 < 3 // 30% income, 70% expense

  const type: 'income' | 'expense' = isIncome ? 'income' : 'expense'

  const category: CategoryType = forceCategory
    ? forceCategory
    : isIncome
      ? faker.helpers.arrayElement(INCOME_CATEGORIES)
      : faker.helpers.arrayElement(EXPENSE_CATEGORIES)

  const merchants = isIncome
    ? INCOME_MERCHANTS[category] || INCOME_MERCHANTS['Freelance']
    : EXPENSE_MERCHANTS[category] || EXPENSE_MERCHANTS['Food & Dining']

  const merchant = faker.helpers.arrayElement(merchants)

  const descriptions = isIncome
    ? INCOME_DESCRIPTIONS[category] || INCOME_DESCRIPTIONS['Freelance']
    : EXPENSE_DESCRIPTIONS[category] || EXPENSE_DESCRIPTIONS['Food & Dining']

  const description = faker.helpers.arrayElement(descriptions)

  const range = isIncome
    ? INCOME_RANGES[category] || INCOME_RANGES['Freelance']
    : EXPENSE_RANGES[category] || EXPENSE_RANGES['Food & Dining']

  let amount = faker.number.int({ min: range[0], max: range[1] })

  if (forceAmountMultiplier) {
    amount = Math.round(amount * forceAmountMultiplier)
  }

  const date = faker.date.between({ from: startDate, to: endDate })

  return {
    id: faker.string.uuid(),
    date,
    amount,
    category,
    type,
    merchant,
    description,
  }
}

// ─── Build 90 transactions ───────────────────────────────
const now = new Date()
const sixMonthsAgo = new Date(
  now.getFullYear(),
  now.getMonth() - 6,
  1,
)

const transactions: Transaction[] = []

// Generate 84 normal transactions
for (let i = 0; i < 84; i++) {
  transactions.push(generateTransaction(i, sixMonthsAgo, now))
}

// ─── Embed 3 anomalies (>2x typical spend) ──────────────
// Anomaly 1: Huge shopping spree
transactions.push(
  generateTransaction(84, sixMonthsAgo, now, 'expense', 'Shopping', 3.5),
)

// Anomaly 2: Massive entertainment splurge
transactions.push(
  generateTransaction(85, sixMonthsAgo, now, 'expense', 'Entertainment', 4),
)

// Anomaly 3: Unexpected health expense
transactions.push(
  generateTransaction(86, sixMonthsAgo, now, 'expense', 'Health', 3),
)

// Fill remaining 3 normal transactions
for (let i = 87; i < 90; i++) {
  transactions.push(generateTransaction(i, sixMonthsAgo, now))
}

// Sort by date descending (most recent first)
transactions.sort((a, b) => b.date.getTime() - a.date.getTime())

// ─── Exports ─────────────────────────────────────────────
export const mockTransactions: Transaction[] = transactions

export const MOCK_USER = {
  name: 'Yash Silwadiya',
  email: 'yashsilwadiya@gmail.com',
  id: 'FIN-90210',
}
