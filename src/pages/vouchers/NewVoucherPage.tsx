import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Timestamp } from 'firebase/firestore'
import { useCreateVoucher } from '@/hooks/useQueries'
import { useAuthStore } from '@/store/authStore'
import { VoucherForm } from '@/components/VoucherForm'
import { PageHeader } from '@/components/ui-helpers'
import { DENO_VALUES, calcTotal } from '@/lib/utils'

export default function NewVoucherPage() {
  const navigate = useNavigate()
  const { user }  = useAuthStore()
  const mutation  = useCreateVoucher()

  return (
    <div className="max-w-3xl animate-fade-in">
      <button onClick={() => navigate('/vouchers')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft size={15} /> Back to Vouchers
      </button>
      <PageHeader title="New Voucher" subtitle="Create a new cash receipt voucher" />
      <div className="bg-card border border-border rounded-xl p-6">
        <VoucherForm
          isLoading={mutation.isPending}
          onSubmit={async (values) => {
            const denoms = values.denominations
              .filter(d => d.quantity > 0)
              .map(d => ({ noteValue: d.noteValue, quantity: d.quantity, subtotal: d.noteValue * d.quantity }))

            await mutation.mutateAsync({
              slipNo:        0, // auto-assigned in createVoucher
              paymentFrom:   values.paymentFrom,
              pointPerson:   values.pointPerson,
              paymentMode:   values.paymentMode as import('@/lib/firestore').PaymentMode,
              paymentStatus: (values.paymentStatus ?? 'pending') as import('@/lib/firestore').PaymentStatus,
              totalAmount:   calcTotal(denoms),
              denominations: denoms,
              headId:        values.headId || undefined,
              headName:      undefined,
              remarks:       values.remarks,
              entryDate:     Timestamp.fromDate(values.entryDate ? new Date(values.entryDate) : new Date()),
              createdById:   user!.id,
              createdByName: user!.name,
            })
            navigate('/vouchers')
          }}
        />
        {mutation.isError && (
          <p className="mt-3 text-sm text-destructive text-center">{(mutation.error as Error).message}</p>
        )}
      </div>
    </div>
  )
}
