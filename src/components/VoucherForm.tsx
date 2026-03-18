import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useHeads } from '@/hooks/useQueries'
import { Voucher } from '@/lib/firestore'
import { DenominationInput } from './DenominationInput'
import { DENO_VALUES, cn } from '@/lib/utils'

const schema = z.object({
  paymentFrom:   z.string().min(1, 'Required'),
  pointPerson:   z.string().min(1, 'Required'),
  paymentMode:   z.enum(['cash','cheque','online_transfer','bank_deposit']),
  paymentStatus: z.enum(['pending','cleared','cancelled']).optional(),
  headId:        z.string().optional(),
  remarks:       z.string().optional(),
  entryDate:     z.string().optional(),
  denominations: z.array(z.object({ noteValue: z.number(), quantity: z.number().min(0) })),
}).refine(d => d.denominations.some(x => x.quantity > 0), { message: 'At least one denomination required', path: ['denominations'] })

type FormValues = z.infer<typeof schema>

const input = 'w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'
const label = 'block text-sm font-medium text-foreground mb-1.5'

export function VoucherForm({ initialData, onSubmit, isLoading, isEdit }: {
  initialData?: Voucher
  onSubmit: (v: FormValues) => void
  isLoading: boolean
  isEdit?: boolean
}) {
  const { data: heads } = useHeads()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentFrom:   initialData?.paymentFrom   ?? '',
      pointPerson:   initialData?.pointPerson   ?? '',
      paymentMode:   initialData?.paymentMode   ?? 'cash',
      paymentStatus: initialData?.paymentStatus ?? 'pending',
      headId:        initialData?.headId        ?? '',
      remarks:       initialData?.remarks       ?? '',
      entryDate:     initialData?.entryDate
        ? initialData.entryDate.toDate().toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      denominations: DENO_VALUES.map(noteValue => ({
        noteValue,
        quantity: initialData?.denominations?.find(d => d.noteValue === noteValue)?.quantity ?? 0,
      })),
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={label}>Payment From <span className="text-destructive">*</span></label>
          <input {...register('paymentFrom')} className={input} placeholder="Person or organisation" />
          {errors.paymentFrom && <p className="mt-1 text-xs text-destructive">{errors.paymentFrom.message}</p>}
        </div>
        <div>
          <label className={label}>Point Person <span className="text-destructive">*</span></label>
          <input {...register('pointPerson')} className={input} placeholder="Responsible contact" />
          {errors.pointPerson && <p className="mt-1 text-xs text-destructive">{errors.pointPerson.message}</p>}
        </div>
        <div>
          <label className={label}>Payment Mode <span className="text-destructive">*</span></label>
          <select {...register('paymentMode')} className={input}>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="online_transfer">Online Transfer</option>
            <option value="bank_deposit">Bank Deposit</option>
          </select>
        </div>
        <div>
          <label className={label}>Status</label>
          <select {...register('paymentStatus')} className={input}>
            <option value="pending">Pending</option>
            <option value="cleared">Cleared</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className={label}>Head / Category</label>
          <select {...register('headId')} className={input}>
            <option value="">— Select head —</option>
            {heads?.map(h => <option key={h.id} value={h.id}>{h.name} ({h.code})</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Entry Date</label>
          <input {...register('entryDate')} type="date" className={input} />
        </div>
      </div>
      <div>
        <label className={label}>Remarks</label>
        <textarea {...register('remarks')} className={cn(input, 'resize-none')} rows={2} placeholder="Optional notes…" />
      </div>
      <DenominationInput
        register={register as Parameters<typeof DenominationInput>[0]['register']}
        watch={watch as Parameters<typeof DenominationInput>[0]['watch']}
        setValue={setValue as Parameters<typeof DenominationInput>[0]['setValue']}
      />
      {errors.denominations && <p className="text-xs text-destructive">{typeof errors.denominations?.message === 'string' ? errors.denominations.message : 'Denomination required'}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => history.back()} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent transition-colors">Cancel</button>
        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors">
          {isLoading && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? 'Update Voucher' : 'Create Voucher'}
        </button>
      </div>
    </form>
  )
}
