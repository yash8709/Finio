import { useMemo } from 'react'
import { useTransactionStore } from '../store/transactionStore'
import { computeInsights } from '../utils/insights'
import type { InsightData } from '../types'

/**
 * Custom hook that computes insights from the transaction store.
 * Memoized — only recomputes when transactions change.
 */
export function useInsights(): InsightData {
  const transactions = useTransactionStore((state) => state.transactions)

  return useMemo(() => {
    return computeInsights(transactions)
  }, [transactions])
}
