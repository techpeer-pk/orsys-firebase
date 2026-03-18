import { Loader2, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { statusConfig } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin text-muted-foreground', className)} size={20} />
}

export function FullPageLoader() {
  return <div className="flex-1 flex items-center justify-center min-h-[300px]"><Spinner className="w-8 h-8" /></div>
}

export function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const { label, color } = statusConfig[status] ?? { label: status, color: '' }
  return <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', color)}>{label}</span>
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, sub, icon: Icon, iconClass }: { label: string; value: string | number; sub?: string; icon?: LucideIcon; iconClass?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconClass ?? 'bg-primary/10')}>
            <Icon size={18} className={iconClass ? 'text-white' : 'text-primary'} />
          </div>
        )}
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }: { icon?: LucideIcon; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4"><Icon size={22} className="text-muted-foreground" /></div>}
      <h3 className="text-sm font-medium">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
