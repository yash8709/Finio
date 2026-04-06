import React from 'react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: React.ReactNode        // lucide icon element
  title: string                // main message
  description: string          // supporting text
  action?: {
    label: string
    onClick: () => void
  }                            // optional CTA button
  size?: 'sm' | 'md' | 'lg'  // sm for inline, md default, lg for full page
}

export function EmptyState({ icon, title, description, action, size = 'md' }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col items-center justify-center text-center
        ${size === 'sm' ? 'py-8 px-4' : ''}
        ${size === 'md' ? 'py-16 px-6' : ''}
        ${size === 'lg' ? 'py-24 px-6' : ''}
      `}
    >
      {/* Icon container with glass treatment */}
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="text-[#4B5563]">
          {icon}
        </div>
      </div>

      {/* Title */}
      <p className="text-base font-semibold text-[#F9FAFB] mb-2">
        {title}
      </p>

      {/* Description */}
      <p className="text-sm text-[#9CA3AF] leading-relaxed max-w-[260px]">
        {description}
      </p>

      {/* Optional action button */}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-4 py-2 rounded-xl text-sm font-medium text-[#10B981] transition-all duration-200 cursor-pointer"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.20)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(16,185,129,0.14)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(16,185,129,0.08)'
          }}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
}
