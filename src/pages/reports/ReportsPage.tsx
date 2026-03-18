import { useState } from 'react'
import { Download, FileSpreadsheet, Search } from 'lucide-react'
import { useReportSummary } from '@/hooks/useQueries'
import { PageHeader, StatCard, FullPageLoader, EmptyState, StatusBadge } from '@/components/ui-helpers'
import { formatPKR, formatDate, DENO_VALUES } from '@/lib/utils'

// Excel export (client-side via SheetJS CDN — no backend needed)
async function exportToExcel(vouchers: import('@/lib/firestore').Voucher[], filename: string) {
  // Dynamically import xlsx
  const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs' as string) as typeof import('xlsx')
  const rows = vouchers.map(v => ({
    'Slip No':       v.slipNo,
    'Date':          formatDate(v.entryDate),
    'Payment From':  v.paymentFrom,
    'Point Person':  v.pointPerson,
    'Head':          v.headName ?? '',
    'Payment Mode':  v.paymentMode,
    'Status':        v.paymentStatus,
    'Total (PKR)':   v.totalAmount,
    ...Object.fromEntries(DENO_VALUES.map(n => [`Note ${n}`, v.denominations.find(d => d.noteValue === n)?.quantity ?? 0])),
    'Remarks':       v.remarks ?? '',
    'Created By':    v.createdByName,
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Vouchers')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export default function ReportsPage() {
  const now = new Date()
  const [from,   setFrom]   = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0])
  const [to,     setTo]     = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState('')
  const [applied, setApplied] = useState({ from, to, status })

  const { data, isLoading } = useReportSummary(new Date(applied.from), new Date(applied.to), applied.status || undefined)

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Reports"
        subtitle="Cash collection summary and exports"
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => data && exportToExcel(data.vouchers, `ORSYS-ARY-${applied.from}-${applied.to}`)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors">
              <FileSpreadsheet size={14} /> Excel
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="cleared">Cleared</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setApplied({ from, to, status })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
              <Search size={14} /> Generate
            </button>
          </div>
        </div>
      </div>

      {isLoading ? <FullPageLoader /> : !data ? null : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Total Amount"    value={formatPKR(data.totalAmount)} sub={`${data.totalCount} vouchers`} />
            <StatCard label="Avg per Voucher" value={data.totalCount ? formatPKR(data.totalAmount / data.totalCount) : '—'} />
            <StatCard label="Date Range"      value={`${formatDate(applied.from)} – ${formatDate(applied.to)}`} />
          </div>

          {Object.values(data.denoSummary).some(v => v > 0) && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border"><h2 className="font-medium text-sm">Denomination Summary</h2></div>
              <div className="grid grid-cols-4 md:grid-cols-8 divide-x divide-border">
                {DENO_VALUES.map(val => (
                  <div key={val} className="p-4 text-center">
                    <p className="text-xs font-mono font-medium text-muted-foreground">{val >= 1000 ? `${val/1000}K` : val}</p>
                    <p className="text-xl font-bold mt-1">{data.denoSummary[val] ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatPKR((data.denoSummary[val] ?? 0) * val)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!data.vouchers.length ? (
            <EmptyState icon={FileSpreadsheet} title="No vouchers in this range" description="Try adjusting the date range" />
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">{data.totalCount} Vouchers</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 text-xs text-muted-foreground">
                      {['Slip','Date','From','Head','Status','Amount'].map((h,i) => (
                        <th key={h} className={`px-4 py-2.5 font-medium ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.vouchers.map(v => (
                      <tr key={v.id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">#{v.slipNo}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{formatDate(v.entryDate)}</td>
                        <td className="px-4 py-2.5 font-medium">{v.paymentFrom}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{v.headName ?? '—'}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={v.paymentStatus} /></td>
                        <td className="px-4 py-2.5 text-right font-semibold font-mono">{formatPKR(v.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/40 font-semibold border-t-2 border-border">
                      <td className="px-4 py-3" colSpan={5}>Total</td>
                      <td className="px-4 py-3 text-right font-mono text-primary">{formatPKR(data.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
