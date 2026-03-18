import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form'
import { DENO_VALUES, formatPKR, cn } from '@/lib/utils'

type FormWithDenoms = { denominations: { noteValue: number; quantity: number }[] } & Record<string, unknown>

export function DenominationInput({ register, watch, setValue }: {
  register: UseFormRegister<FormWithDenoms>
  watch:    UseFormWatch<FormWithDenoms>
  setValue: UseFormSetValue<FormWithDenoms>
}) {
  const denoms = watch('denominations') as { noteValue: number; quantity: number }[]
  const total  = denoms?.reduce((s, d) => s + d.noteValue * (Number(d.quantity) || 0), 0) ?? 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Denomination Breakdown</p>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-semibold font-mono text-primary">{formatPKR(total)}</p>
        </div>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-3 bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
          <span>Note (PKR)</span><span className="text-center">Quantity</span><span className="text-right">Subtotal</span>
        </div>
        <div className="divide-y divide-border">
          {DENO_VALUES.map((noteValue, idx) => {
            const qty = Number(denoms?.[idx]?.quantity) || 0
            return (
              <div key={noteValue} className={cn('grid grid-cols-3 items-center px-4 py-2.5', qty > 0 && 'bg-primary/5')}>
                <input type="hidden" {...register(`denominations.${idx}.noteValue` as const, { valueAsNumber: true })} defaultValue={noteValue} />
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', qty > 0 ? 'bg-primary' : 'bg-border')} />
                  <span className="text-sm font-medium font-mono">{noteValue >= 1000 ? `${noteValue.toLocaleString()}` : noteValue}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button type="button" onClick={() => { const c = Number(denoms?.[idx]?.quantity)||0; if(c>0) setValue(`denominations.${idx}.quantity` as const, c-1) }}
                    className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors">−</button>
                  <input {...register(`denominations.${idx}.quantity` as const, { valueAsNumber: true, min: 0 })} type="number" min={0} placeholder="0"
                    className="w-16 text-center text-sm border border-border rounded-md py-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono" />
                  <button type="button" onClick={() => setValue(`denominations.${idx}.quantity` as const, (Number(denoms?.[idx]?.quantity)||0)+1)}
                    className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors">+</button>
                </div>
                <div className="text-right">
                  <span className={cn('text-sm font-mono', noteValue*qty>0 ? 'text-primary font-medium' : 'text-muted-foreground')}>
                    {noteValue*qty>0 ? formatPKR(noteValue*qty) : '—'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-3 px-4 py-3 bg-muted/50 border-t border-border">
          <span className="text-sm font-semibold col-span-2">Grand Total</span>
          <span className="text-right text-sm font-bold font-mono text-primary">{formatPKR(total)}</span>
        </div>
      </div>
    </div>
  )
}
