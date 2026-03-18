import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, Pencil, Share2, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { useVoucher } from '@/hooks/useQueries'
import { useAuthStore } from '@/store/authStore'
import { PageHeader, FullPageLoader, StatusBadge } from '@/components/ui-helpers'
import { formatPKR, formatDateTime, paymentModeLabel } from '@/lib/utils'

export default function VoucherDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: v, isLoading } = useVoucher(id!)

  const canEdit = ['admin','manager'].includes(user?.role ?? '')

  if (isLoading) return <FullPageLoader />
  if (!v) return <p className="text-muted-foreground text-sm p-4">Voucher not found.</p>

  const handleShare = async () => {
    const text = `*ORSYS-ARY Receipt*\nSlip #${v.slipNo}\nFrom: ${v.paymentFrom}\nAmount: ${formatPKR(v.totalAmount)}\nDate: ${formatDateTime(v.entryDate)}\nStatus: ${v.paymentStatus}`
    if (navigator.share) await navigator.share({ title: `Receipt #${v.slipNo}`, text })
    else { await navigator.clipboard.writeText(text); alert('Copied to clipboard!') }
  }

  const StatusIcon = v.paymentStatus === 'cleared' ? CheckCircle2 : v.paymentStatus === 'cancelled' ? XCircle : Clock

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/vouchers')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-2 no-print">
          <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors"><Share2 size={14} /> Share</button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors"><Printer size={14} /> Print</button>
          {canEdit && <button onClick={() => navigate(`/vouchers/${id}/edit`)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"><Pencil size={14} /> Edit</button>}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header band */}
        <div className="bg-primary px-6 py-5 text-primary-foreground">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs opacity-70 uppercase tracking-wider font-medium">ARY Services</p>
              <h1 className="text-xl font-bold mt-1">Cash Receipt Voucher</h1>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-mono">{formatPKR(v.totalAmount)}</p>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <StatusIcon size={13} className="opacity-80" />
                <span className="text-sm capitalize opacity-80">{v.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Slip Number',  value: `#${v.slipNo}` },
              { label: 'Date',         value: formatDateTime(v.entryDate) },
              { label: 'Payment From', value: v.paymentFrom },
              { label: 'Point Person', value: v.pointPerson },
              { label: 'Payment Mode', value: paymentModeLabel[v.paymentMode] },
              { label: 'Head',         value: v.headName ?? '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {v.remarks && (
            <div className="bg-muted/40 rounded-lg px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Remarks</p>
              <p className="text-sm">{v.remarks}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Denomination Breakdown</p>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 text-xs text-muted-foreground">
                    <th className="text-left px-4 py-2 font-medium">Note (PKR)</th>
                    <th className="text-center px-4 py-2 font-medium">Qty</th>
                    <th className="text-right px-4 py-2 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {v.denominations.map(d => (
                    <tr key={d.noteValue}>
                      <td className="px-4 py-2 font-mono">{d.noteValue.toLocaleString()}</td>
                      <td className="px-4 py-2 text-center">{d.quantity}</td>
                      <td className="px-4 py-2 text-right font-mono">{formatPKR(d.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/40 font-semibold border-t-2 border-border">
                    <td className="px-4 py-2.5" colSpan={2}>Grand Total</td>
                    <td className="px-4 py-2.5 text-right font-mono text-primary">{formatPKR(v.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
            <span>Created by: {v.createdByName}</span>
            <span>Verify: /verify/{v.slipNo}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
