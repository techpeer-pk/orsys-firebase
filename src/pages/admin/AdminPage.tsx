import { useState } from 'react'
import { Users, Tag, Plus, Pencil, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { useHeads, useCreateHead, useDeactivateHead, useAppUsers } from '@/hooks/useQueries'
import { PageHeader } from '@/components/ui-helpers'
import { cn } from '@/lib/utils'
import type { Head } from '@/lib/firestore'

const inp = 'w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50'

// ─── Heads Tab ───────────────────────────────────────
const headSchema = z.object({ name: z.string().min(1), code: z.string().min(1), category: z.string().min(1), description: z.string().optional() })
type HeadForm = z.infer<typeof headSchema>

function HeadsTab() {
  const qc = useQueryClient()
  const { data: heads, isLoading } = useHeads()
  const createMutation   = useCreateHead()
  const deactivateMutation = useDeactivateHead()
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<HeadForm>({ resolver: zodResolver(headSchema) })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { reset(); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={15} /> Add Head
        </button>
      </div>
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-medium text-sm mb-4">New Head</h3>
          <form onSubmit={handleSubmit(async d => { await createMutation.mutateAsync({ ...d, status: 'active' }); setShowForm(false) })} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Name</label>
              <input {...register('name')} className={inp} placeholder="e.g. Office Rent" />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Code</label>
              <input {...register('code')} className={inp} placeholder="e.g. RENT-001" />
              {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
              <input {...register('category')} className={inp} placeholder="e.g. Operations" />
              {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description</label>
              <input {...register('description')} className={inp} placeholder="Optional" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent">Cancel</button>
              <button type="submit" disabled={createMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60">
                {createMutation.isPending && <Loader2 size={13} className="animate-spin" />} Create
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div> : (
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/40 text-xs text-muted-foreground border-b border-border">
              {['Name','Code','Category','Description',''].map(h => <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {(heads ?? []).map(h => (
                <tr key={h.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{h.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{h.code}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{h.category}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{h.description ?? '—'}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => { if (confirm('Deactivate?')) deactivateMutation.mutate(h.id) }} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Deactivate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Users Tab ───────────────────────────────────────
const userSchema = z.object({
  name:     z.string().min(1, 'Required'),
  email:    z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
  role:     z.enum(['admin','manager','cashier','reports']),
})
type UserForm = z.infer<typeof userSchema>

const roleColor: Record<string, string> = {
  admin:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  cashier: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  reports: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

function UsersTab() {
  const { data: users, isLoading } = useAppUsers()
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserForm>({ resolver: zodResolver(userSchema) })

  const createMutation = useMutation({
    mutationFn: async (data: UserForm) => {
      // Create Firebase Auth user + Firestore profile
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password)
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: data.name, email: data.email, role: data.role,
        status: 'active', createdAt: serverTimestamp(),
      })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['app-users'] }); setShowForm(false); reset() },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { reset(); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={15} /> Add User
        </button>
      </div>
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-medium text-sm mb-4">New User</h3>
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
              <input {...register('name')} className={inp} placeholder="Full name" />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
              <input {...register('email')} type="email" className={inp} placeholder="user@aryservices.com.pk" />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
              <input {...register('password')} type="password" className={inp} placeholder="Min 6 characters" />
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Role</label>
              <select {...register('role')} className={inp}>
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="reports">Reports</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent">Cancel</button>
              <button type="submit" disabled={createMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60">
                {createMutation.isPending && <Loader2 size={13} className="animate-spin" />} Create
              </button>
            </div>
            {createMutation.isError && <p className="md:col-span-2 text-xs text-destructive">{(createMutation.error as Error).message}</p>}
          </form>
        </div>
      )}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div> : (
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/40 text-xs text-muted-foreground border-b border-border">
              {['Name','Email','Role','Status'].map(h => <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {(users ?? []).map(u => (
                <tr key={u.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{u.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3.5"><span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', roleColor[u.role])}>{u.role}</span></td>
                  <td className="px-5 py-3.5"><span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground')}>{u.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<'heads'|'users'>('heads')
  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Admin Panel" subtitle="Manage heads and users" />
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        {([['heads','Heads',Tag],['users','Users',Users]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className={cn('flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all', tab === id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>
      {tab === 'heads' ? <HeadsTab /> : <UsersTab />}
    </div>
  )
}
