import { Search, Bell, Moon, Sun, Menu } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useTransactionStore } from '../../store/transactionStore'
import { MOCK_USER } from '../../data/mockData'
import { Avatar } from '../ui/Avatar'
import { useMediaQuery } from '../../hooks/useMediaQuery'

import { useLocation } from 'react-router-dom'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/insights': 'Insights',
}

export function Navbar() {
  const {
    isDarkMode,
    toggleDarkMode,
    toggleSidebar,
  } = useUIStore()
  const { search } = useTransactionStore((s) => s.filters)
  const setFilter = useTransactionStore((s) => s.setFilter)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const location = useLocation()
  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard'

  return (
    <header
      className="glass-navbar h-16 flex items-center justify-between transition-all duration-300 ease-in-out w-full"
      style={{
        paddingLeft: isMobile ? '12px' : '24px',
        paddingRight: isMobile ? '12px' : '24px',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* Hamburger — mobile only */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="flex-shrink-0 p-2 -ml-1 rounded-xl transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <Menu size={22} />
          </button>
        )}
        <h2
          className="text-base md:text-lg font-semibold truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {pageTitle}
        </h2>
      </div>

      {/* ─── Right section ────────────────────────────── */}
      <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
        {/* Search — desktop only */}
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setFilter({ search: e.target.value })}
            placeholder="Search analytics..."
            className="glass-input w-52 text-sm pl-9 pr-3 py-1.5"
          />
        </div>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          <Bell size={18} />
        </button>

        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* User info — hide name/ID on mobile, keep avatar */}
        <div className="flex items-center gap-2.5 pl-2 md:pl-3" style={{ borderLeft: '1px solid var(--divider)' }}>
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{MOCK_USER.name}</p>
          </div>
          <Avatar name={MOCK_USER.name} size="md" />
        </div>
      </div>
    </header>
  )
}
