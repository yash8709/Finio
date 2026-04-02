interface GlassCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export function GlassCard({ children, className = '', onClick, hoverable = false }: GlassCardProps) {
  return (
    <div
      className={`glass-card ${hoverable ? 'glass-card-hoverable cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
