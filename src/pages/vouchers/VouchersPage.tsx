import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, FileText, Trash2, Pencil, Eye } from 'lucide-react'
import { useVouchers, useDeleteVoucher } from '@/hooks/useQueries'
import { useAuthStore } from '@/store/authStore'
import { PageHeader, StatusBadge, FullPageLoader, EmptyState } from '@/components/ui-helpers'
import { formatPKR, formatDate, paymentModeLabel } from '@/lib/utils'
import { PaymentStatus } from '@/lib/firestore'

export default function VouchersPage() {
  const navigate  = useNavigate()
  const { user }  = useAuthStore()
  const [status, setStatus] = useState<PaymentStatus | ''>('')
  const [search,  setSearch]  = useState('')

  const { data: vouchers, isLoading } = useVouchers({ status: status || undefined })
  const deleteMutation = useDeleteVoucher()

  const canCreate = ['admin','manager','cashier'].includes(user?.role ?? '')
  const canEdit   = ['admin','manager'].includes(user?.role ?? '')
  const canDelete = user?.role === 'admin'

  // Client-side search filter
  const filtered = (vouchers ?? []).filter(v =>
    !search ||
    v.paymentFrom.toLowerCase().includes(search.toLowerCase()) ||
    v.pointPerson.toLowerCase().includes(search.toLowerCase()) ||
    String(v.slipNo).includes(search)
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this voucher? This cannot be undone.')) return
    deleteMutation.mutate(id)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Vouchers"
        subtitle={`${filtered.length} vouchers`}
        action={canCreate ? (
          <button onClick={() => navigate('/vouchers/new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={16} /> New Voucher
          </button>
        ) : undefined}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, slip no…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value as PaymentStatus | '')}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[140px]">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="cleared">Cleared</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? <FullPageLoader /> : !filtered.length ? (
          <EmptyState icon={FileText} title="No vouchers found"
            description={search || status ? 'Try adjusting filters' : 'Create your first voucher'}
            action={canCreate ? (
              <button onClick={() => navigate('/vouchers/new')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                <Plus size={15} /> New Voucher
              </button>
            ) : undefined}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
                    {['Slip #','Payment From','Point Person','Mode','Date','Status','Amount',''].map(h => (
                      <th key={h} className={`px-5 py-3 font-medium ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(v => (
                    <tr key={v.id} className="hover:bg-accent/40 transition-colors group">
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">#{v.slipNo}</td>
                      <td className="px-5 py-3.5 font-medium max-w-[180px] truncate">{v.paymentFrom}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{v.pointPerson}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{paymentModeLabel[v.paymentMode]}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{formatDate(v.entryDate)}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={v.paymentStatus} /></td>
                      <td className="px-5 py-3.5 text-right font-semibold font-mono">{formatPKR(v.totalAmount)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => navigate(`/vouchers/${v.id}`)} title="View" className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><Eye size={14} /></button>
                          {canEdit && <button onClick={() => navigate(`/vouchers/${v.id}/edit`)} title="Edit" className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><Pencil size={14} /></button>}
                          {canDelete && <button onClick={() => handleDelete(v.id)} title="Delete" className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {filtered.map(v => (
                <div key={v.id} onClick={() => navigate(`/vouchers/${v.id}`)} className="px-4 py-4 hover:bg-accent/40 cursor-pointer">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{v.paymentFrom}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Slip #{v.slipNo} · {v.pointPerson} · {formatDate(v.entryDate)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold font-mono">{formatPKR(v.totalAmount)}</p>
                      <div className="mt-1"><StatusBadge status={v.paymentStatus} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
