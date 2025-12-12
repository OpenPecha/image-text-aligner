import { create } from 'zustand'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}

interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Toast notifications
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void

  // Modal state
  activeModal: string | null
  modalData: Record<string, unknown>
  openModal: (modalId: string, data?: Record<string, unknown>) => void
  closeModal: () => void

  // Workspace state
  unsavedChanges: boolean
  setUnsavedChanges: (hasChanges: boolean) => void
}

let toastId = 0

export const useUIStore = create<UIState>((set) => ({
  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = `toast_${++toastId}`
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    // Auto-remove after 5 seconds
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 5000)
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clearToasts: () => set({ toasts: [] }),

  // Modal
  activeModal: null,
  modalData: {},
  openModal: (modalId, data = {}) => set({ activeModal: modalId, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: {} }),

  // Workspace
  unsavedChanges: false,
  setUnsavedChanges: (hasChanges) => set({ unsavedChanges: hasChanges }),
}))

