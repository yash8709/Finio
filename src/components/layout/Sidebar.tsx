import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
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
  const location = useLocation()

  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Collapse sidebar on tablet, expand on desktop
  useEffect(() => {
    if (isMobile) {
      setSidebarExpanded(false)
    } else if (isTablet) {
      setSidebarExpanded(false)
    } else {
      setSidebarExpanded(true)
    }
  }, [isTablet, isMobile, setSidebarExpanded])

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile && isSidebarExpanded) {
      setSidebarExpanded(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <>
      {/* Backdrop — mobile only */}
      {isMobile && isSidebarExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={toggleSidebar}
          style={{
            backgroundColor: 'rgba(0,0,0,0.70)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50
          glass-sidebar
          flex flex-col
          transition-all duration-300 ease-out
          ${isMobile
            ? `w-[260px] ${isSidebarExpanded ? 'translate-x-0' : '-translate-x-full'}`
            : `translate-x-0 ${isSidebarExpanded ? 'w-60' : 'w-[72px]'}`
          }
        `}
      >
        <SidebarContent isMobile={isMobile} />
      </aside>
    </>
  )
}

// Extracted content to reuse for mobile/desktop
function SidebarContent({ isMobile }: { isMobile: boolean }) {
  const location = useLocation()
  const {
    isSidebarExpanded,
    toggleSidebar,
    role,
    setRole,
  } = useUIStore()

  // On mobile the sidebar is always "expanded" style when open
  const showExpanded = isMobile ? true : isSidebarExpanded

  return (
    <>
      {/* ─── Logo + Branding ──────────────────────────── */}
      <div className="p-4 flex items-center gap-3 h-16" style={{ borderBottom: '1px solid var(--divider)' }}>
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        {showExpanded && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Finio</h1>
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
                flex items-center ${showExpanded ? 'gap-3 px-3 justify-start' : 'justify-center px-0'} py-2.5 rounded-lg mx-2
                transition-colors duration-200 group relative
                border-l-[3px]
                ${
                  isActive
                    ? 'bg-emerald-500/10 border-emerald-500'
                    : 'border-transparent hover:bg-white/[0.04]'
                }
              `}
              style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              <Icon
                size={20}
                className={`shrink-0 ${isActive ? 'text-emerald-400' : ''}`}
              />

              {showExpanded && (
                <span className="text-sm font-medium">{item.label}</span>
              )}

              {!showExpanded && (
                <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-emerald-950 text-emerald-300 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ─── Sidebar Footer ─────────────────────────────── */}
      <div className="flex flex-col gap-3 p-2" style={{ borderTop: '1px solid var(--divider)' }}>
        {/* ─── Role Switcher ────────────────────────────── */}
        {showExpanded && (
          <div className="flex items-center justify-center">
            <div className="p-1 rounded-lg flex" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>
              <button
                onClick={() => setRole('admin')}
                className={`p-1.5 rounded-md text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  role === 'admin' ? 'bg-emerald-500/15 text-emerald-400' : ''
                }`}
              >
                <Users size={14} /> Admin
              </button>
              <button
                onClick={() => setRole('viewer')}
                className={`p-1.5 rounded-md text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  role === 'viewer' ? 'bg-emerald-500/15 text-emerald-400' : ''
                }`}
              >
                <Users size={14} /> Viewer
              </button>
            </div>
          </div>
        )}

        {/* ─── User Profile (avatar only — identity is in navbar) ── */}
        <div className={`flex items-center p-3 border-t border-theme ${
          showExpanded ? 'justify-start' : 'justify-center'
        }`}>
          <Avatar
            name={MOCK_USER.name}
            size="sm"
          />
        </div>

        {/* ─── Collapse Toggle — desktop/tablet only ──── */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-16 p-1.5 rounded-full bg-emerald-500/50 hover:bg-emerald-500 text-white cursor-pointer"
          >
            {isSidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
      </div>
    </>
  )
}
