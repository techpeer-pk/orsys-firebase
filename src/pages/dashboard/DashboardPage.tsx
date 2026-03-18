import { useNavigate } from 'react-router-dom'
import { FileText, TrendingUp, Clock, CheckCircle2, Plus, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useDashboardStats, useVouchers } from '@/hooks/useQueries'
import { useAuthStore } from '@/store/authStore'
import { PageHeader, StatCard, FullPageLoader, StatusBadge } from '@/components/ui-helpers'
import { formatPKR, formatDate, DENO_VALUES } from '@/lib/utils'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user }  = useAuthStore()
  const { data: stats, isLoading } = useDashboardStats()
  const { data: recent } = useVouchers({ limit: 8 })

  if (isLoading) return <FullPageLoader />

  const denoChart = DENO_VALUES
    .map(val => ({ note: val >= 1000 ? `${val/1000}K` : `${val}`, count: stats?.denoSummary?.[val] ?? 0 }))
    .filter(d => d.count > 0)

  const canCreate = ['admin','manager','cashier'].includes(user?.role ?? '')

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Good ${greet()}, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Cash management overview for this month"
        action={canCreate ? (
          <button onClick={() => navigate('/vouchers/new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={16} /> New Voucher
          </button>
        ) : undefined}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Collected" value={formatPKR(stats?.totalAmount ?? 0)} sub="This month"    icon={TrendingUp}    iconClass="bg-primary text-white" />
        <StatCard label="Total Vouchers"  value={stats?.totalCount ?? 0}             sub="This month"    icon={FileText}      iconClass="bg-violet-500 text-white" />
        <StatCard label="Pending"         value={stats?.pendingCount ?? 0}           sub="Awaiting"      icon={Clock}         iconClass="bg-amber-500 text-white" />
        <StatCard label="Cleared"         value={stats?.clearedCount ?? 0}           sub="Completed"     icon={CheckCircle2}  iconClass="bg-green-600 text-white" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-medium text-sm">Recent Vouchers</h2>
            <button onClick={() => navigate('/vouchers')} className="flex items-center gap-1 text-xs text-primary hover:underline">
              View all <ArrowRight size={12} />
            </button>
          </div>
          {!recent?.length ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No vouchers yet</div>
          ) : (
            <div className="divide-y divide-border">
              {recent.map(v => (
                <div key={v.id} onClick={() => navigate(`/vouchers/${v.id}`)}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-accent/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{v.paymentFrom}</p>
                      <p className="text-xs text-muted-foreground">Slip #{v.slipNo} · {formatDate(v.entryDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <StatusBadge status={v.paymentStatus} />
                    <span className="text-sm font-semibold font-mono">{formatPKR(v.totalAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-medium text-sm">Note Distribution</h2>
            <p className="text-xs text-muted-foreground mt-0.5">This month</p>
          </div>
          <div className="p-4">
            {!denoChart.length ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={denoChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="note" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'hsl(var(--accent))' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4,4,0,0]} name="Qty" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function greet() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
}
