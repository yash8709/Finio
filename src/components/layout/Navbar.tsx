import { Search, Bell, Moon, Sun } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useTransactionStore } from '../../store/transactionStore'
import { MOCK_USER } from '../../data/mockData'
import { Avatar } from '../ui/Avatar'

interface NavbarProps {
  title: string
}

export function Navbar({ title }: NavbarProps) {
  const isDarkMode = useUIStore((s) => s.isDarkMode)
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode)
  const isSidebarExpanded = useUIStore((s) => s.isSidebarExpanded)
  const search = useTransactionStore((s) => s.filters.search)
  const setFilter = useTransactionStore((s) => s.setFilter)

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: isSidebarExpanded ? 240 : 72,
        height: 64,
        zIndex: 20,
        transition: 'left 300ms ease',
      }}
      className="bg-[#080D1A]/80 backdrop-blur-xl border-b border-white/6 flex items-center justify-between px-6"
    >
      {/* ─── Title ────────────────────────────────────── */}
      <h2 className="text-lg font-semibold text-white">{title}</h2>

      {/* ─── Right section ────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setFilter({ search: e.target.value })}
            placeholder="Search analytics..."
            className="
              w-52 bg-white/5 border border-white/10 rounded-lg
              text-sm text-white placeholder:text-white/30
              pl-9 pr-3 py-1.5
              focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20
              transition-all duration-200
            "
          />
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all cursor-pointer">
          <Bell size={18} />
        </button>

        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all cursor-pointer"
        >
          {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* User info */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white leading-tight">{MOCK_USER.name}</p>
            <p className="text-[10px] font-mono text-white/40">{MOCK_USER.id}</p>
          </div>
          <Avatar name={MOCK_USER.name} size="md" />
        </div>
      </div>
    </header>
  )
}
