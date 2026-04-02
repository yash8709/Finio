import { getInitials, getAvatarColor } from '../../utils/formatters'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const initials = getInitials(name)
  const bgColor = getAvatarColor(name)

  return (
    <div
      className={`${SIZE_MAP[size]} rounded-full flex items-center justify-center font-semibold text-white/90 shrink-0`}
      style={{ backgroundColor: `${bgColor}30`, color: bgColor }}
    >
      {initials}
    </div>
  )
}
