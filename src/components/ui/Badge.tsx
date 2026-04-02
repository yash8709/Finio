import type { CategoryType } from '../../types'
import { getCategoryColor, getCategoryBg } from '../../utils/categoryColors'

interface BadgeProps {
  label: string
  color?: string
  size?: 'sm' | 'md'
  category?: CategoryType
}

export function Badge({ label, color, size = 'sm', category }: BadgeProps) {
  const resolvedColor = category ? getCategoryColor(category) : color || '#818CF8'
  const resolvedBg = category ? getCategoryBg(category) : undefined

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full uppercase tracking-wider ${sizeClasses}`}
      style={{
        color: resolvedColor,
        backgroundColor: resolvedBg || `${resolvedColor}26`,
      }}
    >
      {label}
    </span>
  )
}
