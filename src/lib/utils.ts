import { Timestamp } from 'firebase/firestore'

export const formatPKR = (amount: number): string =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

export const formatDate = (ts: Timestamp | Date | string): string => {
  const d = ts instanceof Timestamp ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const formatDateTime = (ts: Timestamp | Date | string): string => {
  const d = ts instanceof Timestamp ? ts.toDate() : new Date(ts)
  return d.toLocaleString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const statusConfig = {
  pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  cleared:   { label: 'Cleared',   color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100   text-red-800   dark:bg-red-900/30   dark:text-red-400'   },
} as const

export const paymentModeLabel: Record<string, string> = {
  cash: 'Cash', cheque: 'Cheque', online_transfer: 'Online Transfer', bank_deposit: 'Bank Deposit',
}

export const DENO_VALUES = [5000, 1000, 500, 100, 50, 20, 10, 1]

export const calcTotal = (denoms: { noteValue: number; quantity: number }[]): number =>
  denoms.reduce((sum, d) => sum + d.noteValue * (Number(d.quantity) || 0), 0)

export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}
