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
  dismissViewerBanner: () => void
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  // ─── State ───────────────────────────────────────────
  role: 'admin',
  isDarkMode: true,
  isSidebarExpanded: true,
  isViewerBannerDismissed: false,

  // ─── Actions ─────────────────────────────────────────
  setRole: (role) => {
    set({ role, isViewerBannerDismissed: false })
  },

  toggleDarkMode: () => {
    set((state) => ({ isDarkMode: !state.isDarkMode }))
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded }))
  },

  dismissViewerBanner: () => {
    set({ isViewerBannerDismissed: true })
  },
}))
