import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { useUIStore } from '../../store/uiStore'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/insights': 'Insights',
}

export function RootLayout() {
  const isSidebarExpanded = useUIStore((s) => s.isSidebarExpanded)
  const role = useUIStore((s) => s.role)
  const isViewerBannerDismissed = useUIStore((s) => s.isViewerBannerDismissed)
  const dismissViewerBanner = useUIStore((s) => s.dismissViewerBanner)
  const location = useLocation()

  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard'
  const showViewerBanner = role === 'viewer' && !isViewerBannerDismissed

  return (
    <div className="min-h-screen bg-[#080D1A] text-white relative">
      {/* ─── Atmospheric glow blobs ───────────────────── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full -translate-y-1/4 translate-x-1/4"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full translate-y-1/4"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* ─── Sidebar ─────────────────────────────────── */}
      <Sidebar />

      {/* ─── Navbar ──────────────────────────────────── */}
      <Navbar title={pageTitle} />

      {/* ─── Main content ────────────────────────────── */}
      <main
        style={{
          marginLeft: isSidebarExpanded ? 240 : 72,
          paddingTop: 64,
          minHeight: '100vh',
          transition: 'margin-left 300ms ease',
        }}
      >
        {/* Viewer Mode Banner */}
        <AnimatePresence>
          {showViewerBanner && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-amber-400" />
                  <span className="text-xs text-amber-300 font-medium">
                    Viewer Mode — Editing features are disabled. Switch to Admin via sidebar.
                  </span>
                </div>
                <button
                  onClick={dismissViewerBanner}
                  className="p-1 rounded text-amber-400/50 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
