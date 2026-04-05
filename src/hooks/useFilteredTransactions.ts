import { useMemo } from 'react'
import { useTransactionStore } from '../store/transactionStore'
import type { Transaction } from '../types'

interface UseFilteredTransactionsReturn {
  filteredTransactions: Transaction[]
  totalCount: number
  filteredCount: number
  activeFilterCount: number
}

export function useFilteredTransactions(): UseFilteredTransactionsReturn {
  const transactions = useTransactionStore((state) => state.transactions)
  const filters = useTransactionStore((state) => state.filters)

  return useMemo(() => {
    let result = [...transactions]

    // ─── Search filter (merchant, description, category) ──
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase().trim()
      result = result.filter(
        (t) =>
          t.merchant.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query),
      )
    }

    // ─── Type filter ──────────────────────────────────────
    if (filters.type !== 'all') {
      result = result.filter((t) => t.type === filters.type)
    }

    // ─── Category filter ──────────────────────────────────
    if (filters.category !== 'all') {
      result = result.filter((t) => t.category === filters.category)
    }

    // ─── Date range filter ────────────────────────────────
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom)
      from.setHours(0, 0, 0, 0)
      result = result.filter((t) => t.date >= from)
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo)
      to.setHours(23, 59, 59, 999)
      result = result.filter((t) => t.date <= to)
    }

    // ─── Min amount filter ─────────────────────────────
    if (filters.minAmount > 0) {
      result = result.filter((t) => t.amount >= filters.minAmount)
    }

    // ─── Max amount filter ─────────────────────────────
    if (filters.maxAmount > 0) {
      result = result.filter((t) => t.amount <= filters.maxAmount)
    }

    // ─── Sort ─────────────────────────────────────────────
    result.sort((a, b) => {
      let comparison = 0

      if (filters.sortBy === 'date') {
        comparison = a.date.getTime() - b.date.getTime()
      } else if (filters.sortBy === 'amount') {
        comparison = a.amount - b.amount
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison
    })

    // ─── Count active filters ─────────────────────────────
    let activeFilterCount = 0
    if (filters.search.trim()) activeFilterCount++
    if (filters.type !== 'all') activeFilterCount++
    if (filters.category !== 'all') activeFilterCount++
    if (filters.dateFrom) activeFilterCount++
    if (filters.dateTo) activeFilterCount++
    if (filters.minAmount > 0) activeFilterCount++
    if (filters.maxAmount > 0) activeFilterCount++
    if (filters.sortBy !== 'date') activeFilterCount++

    return {
      filteredTransactions: result,
      totalCount: transactions.length,
      filteredCount: result.length,
      activeFilterCount,
    }
  }, [transactions, filters])
}
