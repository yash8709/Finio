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
    isSidebarExpanded,
    toggleSidebar,
  } = useUIStore()
  const { search } = useTransactionStore((s) => s.filters)
  const setFilter = useTransactionStore((s) => s.setFilter)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const location = useLocation()
  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard'

  const leftPosition = isMobile ? 0 : isSidebarExpanded ? 240 : 72

  return (
    <header
      style={{
        left: leftPosition,
      }}
      className="glass-navbar fixed top-0 right-0 h-16 z-20 flex items-center justify-between px-4 lg:px-6 transition-[left] duration-300 ease-in-out"
    >
      <div className="flex items-center gap-2">
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg transition-all cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <Menu size={20} />
          </button>
        )}
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{pageTitle}</h2>
      </div>

      {/* ─── Right section ────────────────────────────── */}
      <div className="flex items-center gap-1 md:gap-3">
        {/* Search */}
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

        {/* User info — primary identity location */}
        <div className="flex items-center gap-2.5 pl-3" style={{ borderLeft: '1px solid var(--divider)' }}>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{MOCK_USER.name}</p>
            <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{MOCK_USER.id}</p>
          </div>
          <Avatar name={MOCK_USER.name} size="md" />
        </div>
      </div>
    </header>
  )
}
