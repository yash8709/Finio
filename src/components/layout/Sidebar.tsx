import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Users,
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { MOCK_USER } from '../../data/mockData'
import { Avatar } from '../ui/Avatar'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { label: 'Insights', path: '/insights', icon: Sparkles },
]

export function Sidebar() {
  const location = useLocation()
  const isSidebarExpanded = useUIStore((s) => s.isSidebarExpanded)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const role = useUIStore((s) => s.role)
  const setRole = useUIStore((s) => s.setRole)
  const isDarkMode = useUIStore((s) => s.isDarkMode)
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode)

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen z-30
        bg-[#0a0f1e]/80 backdrop-blur-xl
        border-r border-white/6
        flex flex-col
        transition-all duration-300 ease-out
        ${isSidebarExpanded ? 'w-60' : 'w-[72px]'}
      `}
    >
      {/* ─── Logo + Branding ──────────────────────────── */}
      <div className="p-4 flex items-center gap-3 border-b border-white/6">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        {isSidebarExpanded && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-white tracking-tight">Finio</h1>
            <span className="text-[10px] font-medium uppercase tracking-widest text-emerald-400">
              {role}
            </span>
          </div>
        )}
      </div>

      {/* ─── Navigation ───────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 group relative
                ${isActive
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }
              `}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-400 rounded-r-full" />
              )}

              <Icon size={20} className="shrink-0" />

              {isSidebarExpanded && (
                <span className="text-sm font-medium">{item.label}</span>
              )}

              {/* Tooltip when collapsed */}
              {!isSidebarExpanded && (
                <div className="
                  absolute left-full ml-2 px-2.5 py-1 rounded-lg
                  bg-[#1a1f2d] text-white text-xs font-medium
                  opacity-0 group-hover:opacity-100
                  pointer-events-none transition-opacity duration-200
                  whitespace-nowrap shadow-lg shadow-black/40
                  border border-white/10
                ">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ─── Bottom section ───────────────────────────── */}
      <div className="border-t border-white/6 p-3 space-y-1">
        {/* Admin console badge */}
        {isSidebarExpanded && role === 'admin' && (
          <div className="mb-2 px-3 py-2 rounded-xl bg-white/4">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5">
              Admin Console
            </p>
            <div className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg text-center">
              {MOCK_USER.id}
            </div>
          </div>
        )}

        {/* Role toggle */}
        <button
          onClick={() => setRole(role === 'admin' ? 'viewer' : 'admin')}
          className="
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-white/50 hover:text-white/80 hover:bg-white/5
            transition-all duration-200 cursor-pointer
          "
        >
          <Users size={20} className="shrink-0" />
          {isSidebarExpanded && (
            <span className="text-sm font-medium">Role Toggle</span>
          )}
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-white/50 hover:text-white/80 hover:bg-white/5
            transition-all duration-200 cursor-pointer
          "
        >
          {isDarkMode ? (
            <Moon size={20} className="shrink-0" />
          ) : (
            <Sun size={20} className="shrink-0" />
          )}
          {isSidebarExpanded && (
            <span className="text-sm font-medium">Dark Mode</span>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-white/50 hover:text-white/80 hover:bg-white/5
            transition-all duration-200 cursor-pointer
          "
        >
          {isSidebarExpanded ? (
            <ChevronLeft size={20} className="shrink-0" />
          ) : (
            <ChevronRight size={20} className="shrink-0" />
          )}
          {isSidebarExpanded && (
            <span className="text-sm font-medium">Collapse</span>
          )}
        </button>
      </div>
    </aside>
  )
}
