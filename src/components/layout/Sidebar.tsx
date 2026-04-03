import { useEffect } from 'react'
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
import { Avatar } from '../ui/Avatar'
import { useUIStore } from '../../store/uiStore'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { MOCK_USER } from '../../data/mockData'

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
  const { isSidebarExpanded, toggleSidebar, setSidebarExpanded } = useUIStore()

  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Collapse sidebar on tablet, expand on desktop
  useEffect(() => {
    if (isTablet) {
      setSidebarExpanded(false)
    } else {
      setSidebarExpanded(true)
    }
  }, [isTablet, setSidebarExpanded])

  // Mobile sidebar is an overlay
  if (isMobile) {
    return (
      <>
        {isSidebarExpanded && (
          <div
            className="fixed inset-0 bg-black/60 z-30"
            onClick={toggleSidebar}
          />
        )}
        <aside
          className={`
            fixed top-0 left-0 h-screen z-40
            glass-sidebar
            flex flex-col
            transition-transform duration-300 ease-out
            ${isSidebarExpanded ? 'translate-x-0' : '-translate-x-full'}
            w-60
          `}
        >
          {/* Sidebar content is the same, just wrapped */}
          <SidebarContent />
        </aside>
      </>
    )
  }

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen z-30
        glass-sidebar
        flex flex-col
        transition-all duration-300 ease-out
        ${isSidebarExpanded ? 'w-60' : 'w-[72px]'}
      `}
    >
      <SidebarContent />
    </aside>
  )
}

// Extracted content to reuse for mobile/desktop
function SidebarContent() {
  const location = useLocation()
  const {
    isSidebarExpanded,
    toggleSidebar,
    role,
    setRole,
    isDarkMode,
    toggleDarkMode,
  } = useUIStore()

  return (
    <>
      {/* ─── Logo + Branding ──────────────────────────── */}
      <div className="p-4 flex items-center gap-3 border-b border-white/6 h-16">
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
      <nav className="flex-1 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg mx-2
                transition-colors duration-200 group relative
                border-l-[3px]
                ${
                  isActive
                    ? 'bg-emerald-500/10 border-emerald-500 text-white'
                    : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-300 border-transparent'
                }
              `}
            >
              <Icon
                size={20}
                className={`shrink-0 ${isActive ? 'text-emerald-400' : ''}`}
              />

              {isSidebarExpanded && (
                <span className="text-sm font-medium">{item.label}</span>
              )}

              {!isSidebarExpanded && (
                <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-emerald-950 text-emerald-300 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ─── Sidebar Footer ─────────────────────────────── */}
      <div className="p-2 border-t border-white/6">
        {/* ─── Theme Toggle ─────────────────────────────── */}
        <div className="flex items-center justify-center p-2">
          <div className="p-1 rounded-lg bg-white/5 flex text-gray-400">
            <button
              onClick={() => toggleDarkMode()}
              className={`p-1.5 rounded-md ${
                !isDarkMode ? 'bg-white/10 text-white' : ''
              }`}
            >
              <Sun size={16} />
            </button>
            <button
              onClick={() => toggleDarkMode()}
              className={`p-1.5 rounded-md ${
                isDarkMode ? 'bg-white/10 text-white' : ''
              }`}
            >
              <Moon size={16} />
            </button>
          </div>
        </div>

        {/* ─── Role Switcher ────────────────────────────── */}
        <div className="flex items-center justify-center p-2">
          <div className="p-1 rounded-lg bg-white/5 flex text-gray-400">
            <button
              onClick={() => setRole('admin')}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1.5 ${
                role === 'admin' ? 'bg-white/10 text-white' : ''
              }`}
            >
              <Users size={14} /> Admin
            </button>
            <button
              onClick={() => setRole('viewer')}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1.5 ${
                role === 'viewer' ? 'bg-white/10 text-white' : ''
              }`}
            >
              <Users size={14} /> Viewer
            </button>
          </div>
        </div>

        {/* ─── User Profile ─────────────────────────────── */}
        <div
          className={`
            p-2 flex items-center gap-3
            ${isSidebarExpanded ? 'bg-white/5 rounded-xl' : ''}
          `}
        >
          <Avatar
            name={MOCK_USER.name}
            size="md"
          />
          {isSidebarExpanded && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                {MOCK_USER.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {MOCK_USER.email}
              </p>
            </div>
          )}
        </div>

        {/* ─── Collapse Toggle ──────────────────────────── */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-16 p-1.5 rounded-full bg-emerald-500/50 hover:bg-emerald-500 text-white"
        >
          {isSidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </>
  )
}
