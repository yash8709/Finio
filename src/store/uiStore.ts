import { create } from 'zustand'
import type { RoleType } from '../types'

interface UIState {
  role: RoleType
  isDarkMode: boolean
  isSidebarExpanded: boolean
  isViewerBannerDismissed: boolean
}

interface UIActions {
  setRole: (role: RoleType) => void
  toggleDarkMode: () => void
  toggleSidebar: () => void
  setSidebarExpanded: (isOpen: boolean) => void
  dismissViewerBanner: () => void
}

// ─── Initialize theme from localStorage ────────────────
const savedTheme = localStorage.getItem('finio-theme') || 'dark'
document.documentElement.setAttribute('data-theme', savedTheme)

export const useUIStore = create<UIState & UIActions>((set) => ({
  // ─── State ───────────────────────────────────────────
  role: 'admin',
  isDarkMode: savedTheme === 'dark',
  isSidebarExpanded: true,
  isViewerBannerDismissed: false,

  // ─── Actions ───────────────────────────────────────────
  setRole: (role) => set({ role }),

  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.isDarkMode
      const theme = newMode ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('finio-theme', theme)
      return { isDarkMode: newMode }
    }),

  toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
  setSidebarExpanded: (isOpen) => set({ isSidebarExpanded: isOpen }),
  dismissViewerBanner: () => set({ isViewerBannerDismissed: true }),
}))
