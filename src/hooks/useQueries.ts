import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Timestamp } from 'firebase/firestore'
import {
  listVouchers, getVoucher, createVoucher, updateVoucher, deleteVoucher,
  getVoucherBySlip, listHeads, createHead, updateHead, deactivateHead,
  listAppUsers, VoucherFilter, VoucherPayload,
} from '@/lib/firestore'
import { DENO_VALUES } from '@/lib/utils'

// ─── Vouchers ───────────────────────────────────────

export const useVouchers = (filters: VoucherFilter = {}) =>
  useQuery({
    queryKey: ['vouchers', filters],
    queryFn:  () => listVouchers(filters),
  })

export const useVoucher = (id: string) =>
  useQuery({
    queryKey: ['voucher', id],
    queryFn:  () => getVoucher(id),
    enabled:  !!id,
  })

export const useVerifyVoucher = (slipNo: number | string) =>
  useQuery({
    queryKey: ['verify', slipNo],
    queryFn:  () => getVoucherBySlip(Number(slipNo)),
    enabled:  !!slipNo,
    retry:    false,
  })

export const useCreateVoucher = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createVoucher,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['vouchers'] }),
  })
}

export const useUpdateVoucher = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<VoucherPayload>) => updateVoucher(id, payload),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['vouchers'] })
      qc.invalidateQueries({ queryKey: ['voucher', id] })
    },
  })
}

export const useDeleteVoucher = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteVoucher,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['vouchers'] }),
  })
}

// ─── Dashboard stats (current month) ───────────────

export const useDashboardStats = () => {
  const now   = new Date()
  const from  = new Date(now.getFullYear(), now.getMonth(), 1)
  const to    = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn:  async () => {
      const vouchers = await listVouchers({ from, to, limit: 200 })
      const totalAmount   = vouchers.reduce((s, v) => s + v.totalAmount, 0)
      const pendingCount  = vouchers.filter(v => v.paymentStatus === 'pending').length
      const clearedCount  = vouchers.filter(v => v.paymentStatus === 'cleared').length
      const denoSummary: Record<number, number> = {}
      DENO_VALUES.forEach(v => { denoSummary[v] = 0 })
      vouchers.forEach(v => v.denominations.forEach(d => {
        denoSummary[d.noteValue] = (denoSummary[d.noteValue] ?? 0) + d.quantity
      }))
      return { totalAmount, totalCount: vouchers.length, pendingCount, clearedCount, denoSummary, recent: vouchers.slice(0, 8) }
    },
    staleTime: 1000 * 60 * 2,
  })
}

// ─── Report summary ─────────────────────────────────

export const useReportSummary = (from: Date, to: Date, status?: string) =>
  useQuery({
    queryKey: ['report-summary', from, to, status],
    queryFn:  async () => {
      const vouchers = await listVouchers({
        from, to,
        status: status as VoucherFilter['status'],
        limit: 500,
      })
      const totalAmount = vouchers.reduce((s, v) => s + v.totalAmount, 0)
      const denoSummary: Record<number, number> = {}
      DENO_VALUES.forEach(v => { denoSummary[v] = 0 })
      vouchers.forEach(v => v.denominations.forEach(d => {
        denoSummary[d.noteValue] = (denoSummary[d.noteValue] ?? 0) + d.quantity
      }))
      return { vouchers, totalAmount, totalCount: vouchers.length, denoSummary }
    },
  })

// ─── Heads ──────────────────────────────────────────

export const useHeads = () =>
  useQuery({
    queryKey: ['heads'],
    queryFn:  () => listHeads('active'),
    staleTime: 1000 * 60 * 10,
  })

export const useCreateHead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createHead,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['heads'] }),
  })
}

export const useUpdateHead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateHead>[1] }) => updateHead(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['heads'] }),
  })
}

export const useDeactivateHead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deactivateHead,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['heads'] }),
  })
}

// ─── Admin users ─────────────────────────────────────

export const useAppUsers = () =>
  useQuery({
    queryKey: ['app-users'],
    queryFn:  listAppUsers,
  })
