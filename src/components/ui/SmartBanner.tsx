import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  PieChart,
  BarChart2,
  X,
} from 'lucide-react'
import type { BannerState } from '../../types'

interface SmartBannerProps {
  banner: BannerState
}

const ICON_MAP = {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  PieChart,
  BarChart2,
} as const

type IconName = keyof typeof ICON_MAP

export function SmartBanner({ banner }: SmartBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [prevBannerKey, setPrevBannerKey] = useState(banner.headline)

  // Re-show when data changes (headline changes = different banner state)
  useEffect(() => {
    if (banner.headline !== prevBannerKey) {
      setDismissed(false)
      setPrevBannerKey(banner.headline)
    }
  }, [banner.headline, prevBannerKey])

  const Icon = ICON_MAP[banner.icon as IconName] || BarChart2

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: 'hidden' }}
        >
          <div
            className="glass-card px-5 py-3.5 border-l-4 flex items-center gap-4"
            style={{
              background: banner.bgColor,
              borderLeftColor: banner.color,
            }}
          >
            {/* Icon */}
            <div
              className="p-2 rounded-xl shrink-0"
              style={{ background: `${banner.color}1A` }}
            >
              <span style={{ color: banner.color, display: 'flex' }}>
                <Icon size={18} />
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium text-primary leading-snug"
                style={{ fontFamily: 'Sora' }}
              >
                {banner.headline}
              </p>
              <p className="text-xs text-secondary mt-0.5 leading-relaxed">
                {banner.subline}
              </p>
            </div>

            {/* Dismiss */}
            {banner.dismissible && (
              <button
                onClick={() => setDismissed(true)}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0 group"
                aria-label="Dismiss banner"
              >
                <X
                  size={14}
                  className="text-secondary group-hover:text-secondary transition-colors"
                />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
