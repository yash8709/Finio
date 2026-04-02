import { format } from 'date-fns'

/**
 * Formats a number in Indian Rupee format.
 * 482340 → "₹4,82,340"
 * Positive amounts get "+" prefix, negative get "-" prefix.
 */
export function formatINR(amount: number, showSign = false): string {
  const absAmount = Math.abs(amount)
  const formatted = absAmount.toLocaleString('en-IN')

  if (showSign) {
    const sign = amount >= 0 ? '+' : '-'
    return `${sign} ₹${formatted}`
  }

  if (amount < 0) {
    return `- ₹${formatted}`
  }

  return `₹${formatted}`
}

/**
 * Formats a Date using date-fns format function.
 * @example formatDate(new Date(), 'dd MMM, yyyy') → "02 Apr, 2026"
 */
export function formatDate(date: Date, formatStr: string): string {
  return format(date, formatStr)
}

/**
 * Extracts initials from a name string.
 * "Starbucks Coffee" → "SC"
 * "Zomato" → "ZO"
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }

  return (words[0][0] + words[1][0]).toUpperCase()
}

/**
 * Returns a deterministic color from a name string.
 * Same name always produces the same color.
 */
const AVATAR_COLORS = [
  '#F59E0B', // Amber
  '#38BDF8', // Sky
  '#A78BFA', // Violet
  '#FB7185', // Rose
  '#818CF8', // Indigo
  '#34D399', // Emerald
  '#F472B6', // Pink
  '#10B981', // Green
]

export function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }

  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}
