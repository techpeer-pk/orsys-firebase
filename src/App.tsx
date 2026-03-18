import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/lib/authService'

import AppLayout    from '@/layouts/AppLayout'
import AuthLayout   from '@/layouts/AuthLayout'
import LoginPage    from '@/pages/auth/LoginPage'
import DashboardPage  from '@/pages/dashboard/DashboardPage'
import VouchersPage   from '@/pages/vouchers/VouchersPage'
import NewVoucherPage from '@/pages/vouchers/NewVoucherPage'
import EditVoucherPage  from '@/pages/vouchers/EditVoucherPage'
import VoucherDetailPage from '@/pages/vouchers/VoucherDetailPage'
import ReportsPage  from '@/pages/reports/ReportsPage'
import AdminPage    from '@/pages/admin/AdminPage'
import VerifyPage   from '@/pages/verify/VerifyPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { Spinner }  from '@/components/ui-helpers'

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner className="w-8 h-8" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  const { setUser, setLoading } = useAuthStore()

  // Listen to Firebase auth state changes
  useEffect(() => {
    setLoading(true)
    const unsub = authService.onAuthChange((user) => setUser(user))
    return () => unsub()
  }, [])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route path="/verify/:slipNo" element={<VerifyPage />} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vouchers" element={<VouchersPage />} />
          <Route path="/vouchers/new" element={<NewVoucherPage />} />
          <Route path="/vouchers/:id" element={<VoucherDetailPage />} />
          <Route path="/vouchers/:id/edit" element={<EditVoucherPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
