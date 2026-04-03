interface GlassCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
  style?: React.CSSProperties
}

export function GlassCard({ children, className = '', onClick, hoverable = false, style }: GlassCardProps) {
  return (
    <div
      className={`glass-card ${hoverable ? 'glass-card-hoverable cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  )
}
