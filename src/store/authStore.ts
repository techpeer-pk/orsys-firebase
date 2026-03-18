import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthUser } from '@/lib/authService'

interface AuthState {
  user:            AuthUser | null
  isAuthenticated: boolean
  isLoading:       boolean
  setUser:         (user: AuthUser | null) => void
  setLoading:      (v: boolean) => void
  logout:          () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      isAuthenticated: false,
      isLoading:       true,
      setUser:    (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout:     () => set({ user: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name: 'orsys-auth',
      partialize: (s) => ({ user: s.user ? {
        id: s.user.id, name: s.user.name,
        email: s.user.email, role: s.user.role, status: s.user.status,
      } : null, isAuthenticated: s.isAuthenticated }),
    }
  )
)
