import type { LucideIcon } from 'lucide-react'

interface InputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  icon?: LucideIcon
  type?: string
  className?: string
}

export function Input({
  placeholder = '',
  value,
  onChange,
  icon: Icon,
  type = 'text',
  className = '',
}: InputProps) {
  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <Icon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
        />
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white
          placeholder:text-white/30
          focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20
          transition-all duration-200
          ${Icon ? 'pl-9 pr-3' : 'px-3'} py-2
        `}
      />
    </div>
  )
}
