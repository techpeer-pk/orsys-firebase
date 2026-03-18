import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, BarChart3, Settings, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/lib/authService'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vouchers',  icon: FileText,         label: 'Vouchers'  },
  { to: '/reports',   icon: BarChart3,         label: 'Reports'   },
]

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => { await authService.logout(); logout(); navigate('/login') }

  const NavItems = () => (
    <>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}>
            <Icon size={17} />{label}
            <ChevronRight size={14} className="ml-auto opacity-40" />
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <>
            <p className="px-3 pt-4 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Admin</p>
            <NavLink to="/admin" onClick={() => setOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}>
              <Settings size={17} />Panel
              <ChevronRight size={14} className="ml-auto opacity-40" />
            </NavLink>
          </>
        )}
      </nav>
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
          <LogOut size={17} />Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card">
        <div className="px-6 py-5 border-b border-border flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">A</span>
          </div>
          <div><p className="text-sm font-semibold">ORSYS-ARY</p><p className="text-[11px] text-muted-foreground">Cash Management</p></div>
        </div>
        <NavItems />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col z-50">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center"><span className="text-primary-foreground text-xs font-bold">A</span></div>
                <p className="text-sm font-semibold">ORSYS-ARY</p>
              </div>
              <button onClick={() => setOpen(false)}><X size={18} className="text-muted-foreground" /></button>
            </div>
            <NavItems />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setOpen(true)}><Menu size={20} /></button>
          <p className="text-sm font-semibold">ORSYS-ARY</p>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto page-enter"><Outlet /></main>
      </div>
    </div>
  )
}
