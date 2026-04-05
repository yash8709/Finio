import type { CategoryType } from '../types'

/**
 * Category → hex color mapping.
 * These match the design system exactly.
 */
export const CATEGORY_COLORS: Record<CategoryType, string> = {
  'Food & Dining': '#F59E0B',
  'Transport': '#38BDF8',
  'Entertainment': '#A78BFA',
  'Shopping': '#FB7185',
  'Bills & Utilities': '#818CF8',
  'Health': '#34D399',
  'Subscriptions': '#F472B6',
  'Salary': '#10B981',
  'Freelance': '#6EE7B7',
  'Other': '#9CA3AF',
}

/**
 * Returns the hex color for a given category.
 */
export function getCategoryColor(category: CategoryType): string {
  return CATEGORY_COLORS[category] || '#818CF8'
}

/**
 * Returns an rgba string of the category color at 15% opacity.
 * Used for badge / chip background fills.
 */
export function getCategoryBg(category: CategoryType): string {
  const hex = getCategoryColor(category)

  // Parse hex → RGB
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, 0.15)`
}
