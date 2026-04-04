import { create } from 'zustand'
import type { Transaction, FilterState, Category, SortField, SortOrder } from '../types'
import { mockTransactions } from '../data/mockData'

interface TransactionState {
  transactions: Transaction[]
  filters: FilterState
  isDrawerOpen: boolean
}

interface TransactionActions {
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, updated: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  setFilter: (partial: Partial<FilterState>) => void
  resetFilters: () => void
  toggleDrawer: () => void
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  category: 'all' as Category | 'all',
  type: 'all' as 'income' | 'expense' | 'all',
  dateFrom: '',
  dateTo: '',
  sortBy: 'date' as SortField,
  sortOrder: 'desc' as SortOrder,
  minAmount: 0,
}

export const useTransactionStore = create<TransactionState & TransactionActions>((set) => ({
  // ─── State ───────────────────────────────────────────
  transactions: mockTransactions,
  filters: { ...DEFAULT_FILTERS },
  isDrawerOpen: false,

  // ─── Actions ─────────────────────────────────────────
  setTransactions: (transactions) => {
    set({ transactions })
  },

  addTransaction: (transaction) => {
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    }))
  },

  updateTransaction: (id, updated) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updated } : t,
      ),
    }))
  },

  deleteTransaction: (id) => {
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }))
  },

  setFilter: (partial) => {
    set((state) => ({
      filters: { ...state.filters, ...partial },
    }))
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
  },

  toggleDrawer: () => {
    set((state) => ({ isDrawerOpen: !state.isDrawerOpen }))
  },
}))
