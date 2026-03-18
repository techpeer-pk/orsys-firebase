import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Timestamp } from 'firebase/firestore'
import { useVoucher, useUpdateVoucher } from '@/hooks/useQueries'
import { useAuthStore } from '@/store/authStore'
import { VoucherForm } from '@/components/VoucherForm'
import { PageHeader, FullPageLoader } from '@/components/ui-helpers'
import { calcTotal } from '@/lib/utils'

export default function EditVoucherPage() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const { user }  = useAuthStore()
  const { data: voucher, isLoading } = useVoucher(id!)
  const mutation  = useUpdateVoucher(id!)

  if (isLoading) return <FullPageLoader />
  if (!voucher)  return <p className="text-muted-foreground text-sm">Voucher not found</p>

  return (
    <div className="max-w-3xl animate-fade-in">
      <button onClick={() => navigate(`/vouchers/${id}`)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft size={15} /> Back
      </button>
      <PageHeader title={`Edit Voucher #${voucher.slipNo}`} subtitle={voucher.paymentFrom} />
      <div className="bg-card border border-border rounded-xl p-6">
        <VoucherForm
          initialData={voucher}
          isEdit
          isLoading={mutation.isPending}
          onSubmit={async (values) => {
            const denoms = values.denominations
              .filter(d => d.quantity > 0)
              .map(d => ({ noteValue: d.noteValue, quantity: d.quantity, subtotal: d.noteValue * d.quantity }))
            await mutation.mutateAsync({
              paymentFrom:   values.paymentFrom,
              pointPerson:   values.pointPerson,
              paymentMode:   values.paymentMode as import('@/lib/firestore').PaymentMode,
              paymentStatus: (values.paymentStatus ?? voucher.paymentStatus) as import('@/lib/firestore').PaymentStatus,
              totalAmount:   calcTotal(denoms),
              denominations: denoms,
              headId:        values.headId || undefined,
              remarks:       values.remarks,
              entryDate:     Timestamp.fromDate(values.entryDate ? new Date(values.entryDate) : new Date()),
              updatedById:   user!.id,
            })
            navigate(`/vouchers/${id}`)
          }}
        />
        {mutation.isError && (
          <p className="mt-3 text-sm text-destructive text-center">{(mutation.error as Error).message}</p>
        )}
      </div>
    </div>
  )
}
