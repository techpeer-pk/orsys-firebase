import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, CheckCircle2, XCircle, Loader2, Shield } from 'lucide-react'
import { useVerifyVoucher } from '@/hooks/useQueries'
import { formatPKR, formatDate, paymentModeLabel, statusConfig } from '@/lib/utils'

export default function VerifyPage() {
  const { slipNo: param } = useParams<{ slipNo?: string }>()
  const [input, setInput] = useState(param ?? '')
  const [query, setQuery]  = useState(param ?? '')
  const navigate = useNavigate()

  const { data, isLoading, isError } = useVerifyVoucher(query)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) { navigate(`/verify/${input.trim()}`, { replace: true }); setQuery(input.trim()) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="relative w-full max-w-md space-y-5">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 mb-3">
            <Shield size={22} className="text-blue-400" />
          </div>
          <h1 className="text-white text-xl font-semibold">Receipt Verification</h1>
          <p className="text-slate-400 text-sm mt-1">Verify any ARY Services receipt</p>
        </div>

        <form onSubmit={handleSearch}>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Enter slip number…"
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Search size={15} /> Verify
            </button>
          </div>
        </form>

        {isLoading && <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-8 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-blue-400" /></div>}

        {isError && (
          <div className="bg-slate-900/80 border border-red-500/30 rounded-2xl p-6 text-center">
            <XCircle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-white font-medium">Receipt Not Found</p>
            <p className="text-slate-400 text-sm mt-1">Slip #{query} does not exist.</p>
          </div>
        )}

        {data && (
          <div className="bg-slate-900/80 border border-green-500/30 rounded-2xl overflow-hidden">
            <div className="bg-green-500/10 border-b border-green-500/20 px-5 py-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              <span className="text-green-400 text-sm font-medium">Valid Receipt — Slip #{data.slipNo}</span>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {[
                { label: 'Payment From', value: data.paymentFrom },
                { label: 'Amount',       value: formatPKR(data.totalAmount) },
                { label: 'Date',         value: formatDate(data.entryDate) },
                { label: 'Mode',         value: paymentModeLabel[data.paymentMode] },
                { label: 'Head',         value: data.headName ?? '—' },
                { label: 'Status',       value: statusConfig[data.paymentStatus]?.label ?? data.paymentStatus },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-sm text-white font-medium mt-0.5">{value}</p>
                </div>
              ))}
              <p className="col-span-2 text-xs text-slate-600 text-center pt-2 border-t border-slate-800">Verified via ORSYS-ARY · ARY Services</p>
            </div>
          </div>
        )}
        <p className="text-center text-slate-600 text-xs"><a href="/login" className="hover:text-slate-400 transition-colors">Staff login →</a></p>
      </div>
    </div>
  )
}
