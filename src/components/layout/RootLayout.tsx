import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { useUIStore } from '../../store/uiStore'
import { useTransactionStore } from '../../store/transactionStore'
import { mockTransactions } from '../../data/mockData'
import { useEffect, useRef } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'

const SIDEBAR_EXPANDED = 240
const SIDEBAR_COLLAPSED = 72
const NAVBAR_HEIGHT = 64

export function RootLayout() {
  const { 
    isSidebarExpanded, 
    isDarkMode,
    role, 
    isViewerBannerDismissed,
    dismissViewerBanner 
  } = useUIStore()
  
  const { setTransactions } = useTransactionStore()
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  // Initialize mock data ONCE
  const initialized = useRef(false)
  useEffect(() => {
    if (!initialized.current) {
      setTransactions(mockTransactions)
      initialized.current = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const sidebarWidth = isMobile
    ? 0
    : isSidebarExpanded 
      ? SIDEBAR_EXPANDED 
      : SIDEBAR_COLLAPSED

  // Glow blob opacities — dimmer in light mode
  const glowIndigo = isDarkMode
    ? 'radial-gradient(circle at center, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)'
    : 'radial-gradient(circle at center, rgba(99,102,241,0.05) 0%, rgba(99,102,241,0.02) 40%, transparent 70%)'

  const glowEmerald = isDarkMode
    ? 'radial-gradient(circle at center, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 40%, transparent 70%)'
    : 'radial-gradient(circle at center, rgba(5,150,105,0.04) 0%, rgba(5,150,105,0.01) 40%, transparent 70%)'

  const glowViolet = isDarkMode
    ? 'radial-gradient(circle at center, rgba(139,92,246,0.06) 0%, transparent 70%)'
    : 'radial-gradient(circle at center, rgba(139,92,246,0.02) 0%, transparent 70%)'

  return (
    <div className="min-h-screen relative"
      style={{ backgroundColor: 'var(--bg-base)' }}>
      
      {/* Background glow blobs — MUST be here */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}>
        
        {/* Indigo blob — top right */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: glowIndigo,
          filter: 'blur(60px)',
          transform: 'translateZ(0)',
          transition: 'background 400ms ease',
        }} />
        
        {/* Emerald blob — bottom left */}
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: glowEmerald,
          filter: 'blur(60px)',
          transform: 'translateZ(0)',
          transition: 'background 400ms ease',
        }} />
        
        {/* Subtle violet blob — center */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '40%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: glowViolet,
          filter: 'blur(80px)',
          transform: 'translateZ(0)',
          transition: 'background 400ms ease',
        }} />
      </div>
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div style={{
        marginLeft: sidebarWidth,
        paddingTop: 0,
        minHeight: '100vh',
        transition: 'margin-left 300ms ease',
        position: 'relative',
        zIndex: 1,
        width: isMobile ? '100%' : 'auto',
        overflowX: 'hidden',
      }}>
        {/* Navbar */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: sidebarWidth,
          right: 0,
          height: NAVBAR_HEIGHT,
          zIndex: 40,
          transition: 'left 300ms ease',
        }}>
          <Navbar />
        </div>
        
        {/* Viewer banner */}
        <AnimatePresence>
          {role === 'viewer' && 
           !isViewerBannerDismissed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-2 text-xs"
              style={{
                background: 'rgba(245,158,11,0.08)',
                borderBottom: '1px solid rgba(245,158,11,0.2)',
              }}>
              <span className="text-amber-300">
                👁 You are in Viewer mode. Switch to Admin to make changes.
              </span>
              <button 
                onClick={dismissViewerBanner}
                className="text-amber-400 hover:text-amber-200 ml-4">
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Page content */}
        <main className="w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
