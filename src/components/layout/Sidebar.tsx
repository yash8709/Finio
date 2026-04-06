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
      {isMobile && (
        <div
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
            isSidebarExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          flex flex-col transform
          transition-all duration-300
          ${isMobile 
            ? 'ease-[cubic-bezier(0.22,1,0.36,1)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]' 
            : 'ease-in-out'
          }
          ${isMobile
            ? `w-[85%] max-w-[280px] bg-[#0B1220] backdrop-blur-none border-r border-white/10 ${isSidebarExpanded ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`
            : `glass-sidebar translate-x-0 ${isSidebarExpanded ? 'w-60' : 'w-[72px]'}`
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
      <div 
        className={isMobile ? "px-4 py-4 border-b border-white/10 flex items-center gap-3 shrink-0" : "p-4 flex items-center gap-3 h-16"} 
        style={!isMobile ? { borderBottom: '1px solid var(--divider)' } : undefined}
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        {showExpanded && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold tracking-tight" style={isMobile ? { color: 'white' } : { color: 'var(--text-primary)' }}>Finio</h1>
            <span className="text-[10px] font-medium uppercase tracking-widest text-emerald-400">
              {role}
            </span>
          </div>
        )}
      </div>

      {/* ─── Navigation ───────────────────────────────── */}
      <nav className={isMobile ? "flex-1 px-4 py-4 space-y-3 overflow-y-auto" : "flex-1 py-4 space-y-1"}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className={
                isMobile
                  ? `
                      flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-all duration-200 group relative border-l-[3px]
                      ${isActive 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' 
                          : 'text-white/90 hover:text-white hover:bg-white/10 active:bg-white/15 border-transparent'
                       }
                    `
                  : `
                      flex items-center ${showExpanded ? 'gap-3 px-3 justify-start' : 'justify-center px-0'} py-2.5 rounded-lg mx-2
                      transition-colors duration-200 group relative border-l-[3px]
                      ${isActive
                          ? 'bg-emerald-500/10 border-emerald-500'
                          : 'border-transparent hover:bg-white/[0.04]'
                      }
                    `
              }
              style={!isMobile ? { color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' } : undefined}
            >
              <Icon
                size={20}
                className={`shrink-0 ${
                  isMobile
                    ? (isActive ? 'text-emerald-400' : 'text-white/70 group-hover:text-white')
                    : (isActive ? 'text-emerald-400' : '')
                }`}
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
      <div 
        className={isMobile ? "px-4 py-5 border-t border-white/10 shrink-0" : "flex flex-col gap-3 p-2"} 
        style={!isMobile ? { borderTop: '1px solid var(--divider)' } : undefined}
      >
        {/* ─── Role Switcher ────────────────────────────── */}
        {showExpanded && (
          <div className={isMobile ? "w-full flex items-center justify-between bg-white/5 rounded-lg p-2" : "flex items-center justify-center p-1 rounded-lg bg-[var(--input-bg)] text-[var(--text-muted)]"}>
              <button
                onClick={() => setRole('admin')}
                className={`flex items-center gap-1.5 transition-all cursor-pointer ${
                  isMobile 
                    ? `flex-1 justify-center py-2 rounded-md ${role === 'admin' ? 'bg-emerald-500/20 text-emerald-400 font-medium' : 'text-white/60 hover:text-white'}`
                    : `p-1.5 rounded-md text-xs ${role === 'admin' ? 'bg-emerald-500/15 text-emerald-400' : ''}`
                }`}
              >
                <Users size={14} /> Admin
              </button>
              <button
                onClick={() => setRole('viewer')}
                className={`flex items-center gap-1.5 transition-all cursor-pointer ${
                  isMobile 
                    ? `flex-1 justify-center py-2 rounded-md ${role === 'viewer' ? 'bg-emerald-500/20 text-emerald-400 font-medium' : 'text-white/60 hover:text-white'}`
                    : `p-1.5 rounded-md text-xs ${role === 'viewer' ? 'bg-emerald-500/15 text-emerald-400' : ''}`
                }`}
              >
                <Users size={14} /> Viewer
              </button>
          </div>
        )}

        {/* ─── User Profile (avatar only — identity is in navbar) ── */}
        {!isMobile && (
          <div className={`flex items-center p-3 border-t border-theme ${
            showExpanded ? 'justify-start' : 'justify-center'
          }`}>
            <Avatar
              name={MOCK_USER.name}
              size="sm"
            />
          </div>
        )}

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
