import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  Plus,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  ChevronDown,
  Calendar,
  Store,
  Tag,
  IndianRupee,
} from 'lucide-react'
import { subDays } from 'date-fns'
import { GlassCard } from '../components/ui/GlassCard'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Drawer } from '../components/ui/Drawer'
import { useFilteredTransactions } from '../hooks/useFilteredTransactions'
import { useTransactionStore } from '../store/transactionStore'
import { useUIStore } from '../store/uiStore'
import { useInsights } from '../hooks/useInsights'
import { formatINR, formatDate } from '../utils/formatters'
import type { Transaction, Category, FilterState } from '../types'
import { faker } from '@faker-js/faker'

const ITEMS_PER_PAGE = 10

const ALL_CATEGORIES: Category[] = [
  'Food & Dining',
  'Transport',
  'Entertainment',
  'Shopping',
  'Bills & Utilities',
  'Health',
  'Subscriptions',
  'Salary',
  'Freelance',
]

// ─── Animation variants ─────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.2 } },
}

// ─── Filter Presets ──────────────────────────────────────
interface FilterPreset {
  id: string
  label: string
  description: string
  filters: Partial<FilterState>
  anomalyIds?: string[]
}

function buildFilterPresets(anomalyIds: string[]): FilterPreset[] {
  const now = new Date()
  return [
    {
      id: 'high-expenses',
      label: '📈 High Expenses',
      description: 'Transactions over ₹5,000',
      filters: { type: 'expense', minAmount: 5000 },
    },
    {
      id: 'subscriptions',
      label: '🔁 Subscriptions',
      description: 'Category: Subscriptions',
      filters: { category: 'Subscriptions' },
    },
    {
      id: 'last-7-days',
      label: '📅 Last 7 Days',
      description: 'Past week only',
      filters: {
        dateFrom: subDays(now, 7).toISOString().split('T')[0],
        dateTo: now.toISOString().split('T')[0],
      },
    },
    {
      id: 'anomalies',
      label: '⚠️ Anomalies',
      description: 'Unusual spending detected',
      filters: {},
      anomalyIds,
    },
    {
      id: 'income-only',
      label: '💰 Income Only',
      description: 'Income transactions',
      filters: { type: 'income' },
    },
  ]
}

// ─── Transactions Page ───────────────────────────────────
export function Transactions() {
  const { filteredTransactions, totalCount, filteredCount, activeFilterCount } =
    useFilteredTransactions()
  const filters = useTransactionStore((s) => s.filters)
  const setFilter = useTransactionStore((s) => s.setFilter)
  const resetFilters = useTransactionStore((s) => s.resetFilters)
  const isDrawerOpen = useTransactionStore((s) => s.isDrawerOpen)
  const toggleDrawer = useTransactionStore((s) => s.toggleDrawer)
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)
  const transactions = useTransactionStore((s) => s.transactions)
  const role = useUIStore((s) => s.role)
  const insights = useInsights()

  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const isApplyingPreset = useRef(false)

  // Anomaly transaction IDs for preset
  const anomalyIds = useMemo(
    () => insights.anomalies.map((a) => a.transaction.id),
    [insights.anomalies],
  )

  const filterPresets = useMemo(() => buildFilterPresets(anomalyIds), [anomalyIds])

  // ─── Form state for drawer ─────────────────────────────
  const [formAmount, setFormAmount] = useState('')
  const [formMerchant, setFormMerchant] = useState('')
  const [formCategory, setFormCategory] = useState<Category>('Food & Dining')
  const [formType, setFormType] = useState<'income' | 'expense'>('expense')
  const [formDate, setFormDate] = useState('')
  const [formDescription, setFormDescription] = useState('')

  useEffect(() => {
    setCurrentPage(1)
    // Deactivate preset if user changes filters manually
    if (!isApplyingPreset.current && activePreset) {
      setActivePreset(null)
    }
    isApplyingPreset.current = false
  }, [filters])

  // ─── Preset handlers ──────────────────────────────────
  const handlePresetClick = useCallback(
    (preset: FilterPreset) => {
      if (activePreset === preset.id) {
        // Deactivate
        setActivePreset(null)
        resetFilters()
        return
      }

      isApplyingPreset.current = true
      setActivePreset(preset.id)
      resetFilters()

      // For anomalies, use search-based approach with anomaly IDs
      if (preset.id === 'anomalies' && preset.anomalyIds?.length) {
        // Filter by searching the anomaly merchant names
        const anomalyTxns = transactions.filter((t) =>
          preset.anomalyIds!.includes(t.id),
        )
        if (anomalyTxns.length > 0) {
          const firstMerchant = anomalyTxns[0].merchant
          isApplyingPreset.current = true
          setFilter({ search: firstMerchant })
        }
        return
      }

      if (Object.keys(preset.filters).length > 0) {
        isApplyingPreset.current = true
        setFilter(preset.filters)
      }
    },
    [activePreset, resetFilters, setFilter, transactions],
  )

  // ─── Pagination ────────────────────────────────────────
  const totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  // Page numbers to display
  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }, [totalPages, currentPage])

  // ─── CSV Export ────────────────────────────────────────
  function handleExportCSV() {
    const headers = ['Date', 'Merchant', 'Category', 'Type', 'Amount', 'Description']
    const rows = filteredTransactions.map((t) => [
      formatDate(t.date, 'dd MMM yyyy'),
      t.merchant,
      t.category,
      t.type,
      t.amount.toString(),
      t.description,
    ])
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finio-transactions-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Add Transaction ──────────────────────────────────
  function handleAddTransaction() {
    if (!formAmount || !formMerchant) return

    const transaction: Transaction = {
      id: faker.string.uuid(),
      amount: parseFloat(formAmount),
      merchant: formMerchant,
      category: formCategory,
      type: formType,
      date: formDate ? new Date(formDate) : new Date(),
      description: formDescription || `${formType === 'income' ? 'Income' : 'Payment'} - ${formMerchant}`,
    }

    addTransaction(transaction)
    resetForm()
    toggleDrawer()
  }

  function resetForm() {
    setFormAmount('')
    setFormMerchant('')
    setFormCategory('Food & Dining')
    setFormType('expense')
    setFormDate('')
    setFormDescription('')
  }

  // ─── Active filter chips ───────────────────────────────
  const activeFilters: { label: string; onRemove: () => void }[] = []

  if (filters.search.trim()) {
    activeFilters.push({
      label: `Search: "${filters.search}"`,
      onRemove: () => setFilter({ search: '' }),
    })
  }
  if (filters.type !== 'all') {
    activeFilters.push({
      label: `Type: ${filters.type}`,
      onRemove: () => setFilter({ type: 'all' }),
    })
  }
  if (filters.category !== 'all') {
    activeFilters.push({
      label: `Category: ${filters.category}`,
      onRemove: () => setFilter({ category: 'all' }),
    })
  }
  if (filters.dateFrom) {
    activeFilters.push({
      label: `From: ${filters.dateFrom}`,
      onRemove: () => setFilter({ dateFrom: '' }),
    })
  }
  if (filters.dateTo) {
    activeFilters.push({
      label: `To: ${filters.dateTo}`,
      onRemove: () => setFilter({ dateTo: '' }),
    })
  }

  return (
    <motion.div
      className="space-y-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* ─── Filter Preset Chips ──────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filterPresets.map((preset) => {
          const isActive = activePreset === preset.id
          return (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset)}
              title={preset.description}
              className={`
                glass-card px-3 py-1.5 rounded-full text-xs cursor-pointer whitespace-nowrap
                flex items-center gap-1.5 transition-all duration-200
                ${isActive
                  ? 'border border-[#10B981] text-[#10B981]'
                  : 'text-secondary hover:border-white/20 hover:text-primary'
                }
              `}
            >
              {preset.label}
              {isActive && (
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    setActivePreset(null)
                    resetFilters()
                  }}
                  className="ml-0.5 p-0.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={10} />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ─── Controls Bar ──────────────────────────────── */}
      <GlassCard className="p-4 sticky top-16 z-10">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px] max-w-[320px]">
            <Input
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(v) => setFilter({ search: v })}
              icon={Search}
            />
          </div>

          {/* Filters toggle */}
          <Button
            variant="ghost"
            size="sm"
            icon={SlidersHorizontal}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-emerald-500 text-primary text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Sort by date toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setFilter({
                sortBy: 'date',
                sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc',
              })
            }
          >
            Sort by Date
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                filters.sortOrder === 'asc' ? 'rotate-180' : ''
              }`}
            />
          </Button>

          <div className="flex-1" />

          {/* Admin / Export actions */}
          <div className="relative group flex items-center">
            <div className={role !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}>
              <Button
                variant="ghost"
                size="sm"
                icon={Download}
                onClick={role === 'admin' ? handleExportCSV : undefined}
                className={role !== 'admin' ? 'pointer-events-none' : ''}
              >
                Export CSV
              </Button>
            </div>
            {role !== 'admin' && (
              <div className="absolute top-[120%] right-0 mt-1 px-3 py-1.5 rounded-lg bg-[#080D1A] border border-white/10 text-xs text-secondary opacity-0 group-hover:opacity-100 transition-duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                Only admins can export data
              </div>
            )}
          </div>

          {role === 'admin' && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                resetForm()
                toggleDrawer()
              }}
            >
              Add Transaction
            </Button>
          )}
        </div>

        {/* ─── Collapsible Filter Panel ──────────────── */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            isFiltersOpen ? 'max-h-[300px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-white/6 pt-4 space-y-4">
            {/* Type segmented control */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-secondary mb-2 block">
                Transaction Type
              </label>
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 w-fit">
                {(['all', 'income', 'expense'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter({ type: t })}
                    className={`
                      px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer capitalize
                      ${filters.type === t
                        ? t === 'income'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : t === 'expense'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-white/10 text-primary'
                        : 'text-secondary hover:text-secondary'
                      }
                    `}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-4 flex-wrap">
              {/* Category select */}
              <div className="min-w-[200px]">
                <label className="text-[10px] uppercase tracking-widest text-secondary mb-2 block">
                  Category
                </label>
                <div className="relative">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                  <select
                    value={filters.category}
                    onChange={(e) => setFilter({ category: e.target.value as Category | 'all' })}
                    className="
                      w-full glass-input
                      pl-9 pr-3 py-2 appearance-none cursor-pointer
                    "
                  >
                    <option value="all" className="bg-[#1a1f2d]">All Categories</option>
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#1a1f2d]">{cat}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                </div>
              </div>

              {/* Date from */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-secondary mb-2 block">
                  From Date
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(v) => setFilter({ dateFrom: v })}
                  icon={Calendar}
                />
              </div>

              {/* Date to */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-secondary mb-2 block">
                  To Date
                </label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(v) => setFilter({ dateTo: v })}
                  icon={Calendar}
                />
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {activeFilters.map((f, i) => (
                  <span
                    key={i}
                    className="
                      inline-flex items-center gap-1.5
                      bg-white/5 border border-white/10 rounded-full
                      text-xs text-secondary px-3 py-1
                    "
                  >
                    {f.label}
                    <button
                      onClick={f.onRemove}
                      className="text-secondary hover:text-secondary cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={resetFilters}
                  className="text-xs text-rose-400/70 hover:text-rose-400 cursor-pointer transition-colors ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* ─── Transaction Count ─────────────────────────── */}
      <p className="text-xs text-secondary">
        Showing <span className="font-mono text-secondary">{filteredCount}</span> of{' '}
        <span className="font-mono text-secondary">{totalCount}</span> transactions
      </p>

      {/* ─── Transactions Table ────────────────────────── */}
      {filteredCount === 0 ? (
        /* Empty state */
        <GlassCard className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-secondary" />
          </div>
          <h3 className="text-lg font-medium text-secondary mb-1">No transactions found</h3>
          <p className="text-sm text-secondary">
            Try adjusting your filters or search query.
          </p>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="mt-4">
              Clear all filters
            </Button>
          )}
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[90px_1fr_130px_100px_110px_80px] gap-4 px-6 py-3 border-b border-white/6">
            <span className="text-[10px] uppercase tracking-widest text-secondary font-medium">Date</span>
            <span className="text-[10px] uppercase tracking-widest text-secondary font-medium">Merchant</span>
            <span className="text-[10px] uppercase tracking-widest text-secondary font-medium">Category</span>
            <span className="text-[10px] uppercase tracking-widest text-secondary font-medium">Type</span>
            <span className="text-[10px] uppercase tracking-widest text-secondary font-medium text-right">Amount</span>
            <span className="text-[10px] uppercase tracking-widest text-secondary font-medium text-right">Actions</span>
          </div>

          {/* Table body */}
          <motion.div
            className="divide-y divide-white/[0.03]"
            variants={listVariants}
            initial="hidden"
            animate="show"
            key={JSON.stringify(filters)}
          >
            {paginatedTransactions.map((t) => (
              <motion.div key={t.id} variants={rowVariants}>
                {/* Main row */}
                <div
                  className="grid grid-cols-[90px_1fr_130px_100px_110px_80px] gap-4 px-4 py-3 items-center group hover:bg-white/[0.03] border-b border-white/[0.04] cursor-pointer transition-colors duration-150"
                  onClick={() => setExpandedRowId(expandedRowId === t.id ? null : t.id)}
                >
                  {/* Date */}
                  <div className="flex flex-col">
                    <span className="text-sm text-primary font-mono">
                      {formatDate(t.date, 'dd MMM')}
                    </span>
                    <span className="text-xs text-secondary">
                      {formatDate(t.date, 'h:mm a')}
                    </span>
                  </div>

                  {/* Merchant */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={t.merchant} size="sm" />
                    <span className="text-sm text-primary truncate">{t.merchant}</span>
                  </div>

                  {/* Category */}
                  <Badge label={t.category.split('&')[0].trim()} category={t.category} size="sm" />

                  {/* Type */}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full w-fit ${
                    t.type === 'income'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {t.type === 'income' ? 'Income' : 'Expense'}
                  </span>

                  {/* Amount */}
                  <span className={`font-mono font-semibold text-sm text-right ${
                    t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {t.type === 'income' ? '+' : '-'} {formatINR(t.amount)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {role === 'admin' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setFormAmount(t.amount.toString())
                            setFormMerchant(t.merchant)
                            setFormCategory(t.category)
                            setFormType(t.type)
                            setFormDate(formatDate(t.date, 'yyyy-MM-dd'))
                            setFormDescription(t.description)
                            toggleDrawer()
                          }}
                          className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-white/5 transition-all cursor-pointer"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteTransaction(t.id)
                          }}
                          className="p-1.5 rounded-lg text-secondary hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded row */}
                <AnimatePresence>
                  {expandedRowId === t.id && (
                    <motion.div
                      className="px-6 pb-4 pt-1 bg-white/[0.01] border-t border-white/[0.03] overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <div className="grid grid-cols-3 gap-6 text-sm py-2">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-secondary block mb-1">
                            Description
                          </span>
                          <p className="text-secondary">{t.description}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-secondary block mb-1">
                            Transaction ID
                          </span>
                          <p className="font-mono text-secondary text-xs">{t.id.slice(0, 12)}...</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-secondary block mb-1">
                            Full Date
                          </span>
                          <p className="text-secondary">
                            {formatDate(t.date, 'EEEE, dd MMMM yyyy • hh:mm a')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* ─── Pagination ────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/6">
              <p className="text-xs text-secondary">
                Page <span className="font-mono text-secondary">{currentPage}</span> of{' '}
                <span className="font-mono text-secondary">{totalPages}</span>
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>

                {pageNumbers.map((page, i) =>
                  page === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-secondary text-sm">
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`
                        w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer
                        ${currentPage === page
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'text-secondary hover:text-primary hover:bg-white/5'
                        }
                      `}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {/* ─── Add Transaction Drawer ────────────────────── */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={toggleDrawer}
        title="New Transaction"
        subtitle="Record a new manual entry"
      >
        <div className="space-y-5">
          {/* Amount */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-secondary mb-2 block">
              Amount
            </label>
            <div className="relative">
              <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
              <input
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0.00"
                className="
                  w-full bg-white/5 border border-white/10 rounded-lg
                  text-2xl font-mono font-bold text-primary
                  pl-9 pr-3 py-3
                  focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20
                  transition-all duration-200
                  placeholder:text-secondary
                "
              />
            </div>
          </div>

          {/* Transaction type toggle */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-secondary mb-2 block">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormType('income')}
                className={`
                  py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${formType === 'income'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-secondary border border-white/10 hover:border-white/20'
                  }
                `}
              >
                Income
              </button>
              <button
                onClick={() => setFormType('expense')}
                className={`
                  py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${formType === 'expense'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-white/5 text-secondary border border-white/10 hover:border-white/20'
                  }
                `}
              >
                Expense
              </button>
            </div>
          </div>

          {/* Merchant */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-secondary mb-2 block">
              Merchant / Payee
            </label>
            <Input
              placeholder="e.g. Amazon India"
              value={formMerchant}
              onChange={setFormMerchant}
              icon={Store}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-secondary mb-2 block">
              Category
            </label>
            <div className="relative">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as Category)}
                className="
                  w-full glass-input
                  pl-9 pr-8 py-2.5 appearance-none cursor-pointer
                "
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#1a1f2d]">{cat}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-secondary mb-2 block">
              Transaction Date
            </label>
            <Input
              type="date"
              value={formDate}
              onChange={setFormDate}
              icon={Calendar}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-secondary mb-2 block">
              Description (Optional)
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="
                w-full glass-input
                px-3 py-2.5 resize-none
              "
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 space-y-3">
            <Button
              variant="primary"
              onClick={handleAddTransaction}
              disabled={!formAmount || !formMerchant}
              className="w-full py-3"
            >
              Add Transaction
            </Button>
            <button
              onClick={() => {
                resetForm()
                toggleDrawer()
              }}
              className="
                w-full py-2.5 rounded-lg text-sm font-medium
                bg-white/5 text-secondary border border-white/10
                hover:bg-white/10 hover:text-secondary
                transition-all duration-200 cursor-pointer
              "
            >
              Cancel
            </button>
          </div>
        </div>
      </Drawer>
    </motion.div>
  )
}
