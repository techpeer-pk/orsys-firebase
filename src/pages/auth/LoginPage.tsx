import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/lib/authService'

const schema = z.object({
  email:    z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
})
type Form = z.infer<typeof schema>

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false)
  const setUser = useAuthStore(s => s.setUser)

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: ({ email, password }: Form) => authService.login(email, password),
    onSuccess:  (user) => setUser(user),
  })

  return (
    <div className="animate-fade-in">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg leading-tight">ORSYS-ARY</h1>
              <p className="text-slate-400 text-xs">Cash Management System</p>
            </div>
          </div>
          <h2 className="text-white text-2xl font-semibold">Welcome back</h2>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account to continue</p>
        </div>

        {mutation.isError && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {(mutation.error as Error).message || 'Invalid email or password'}
          </div>
        )}

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
            <input {...register('email')} type="email" autoComplete="email" placeholder="you@aryservices.com.pk"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input {...register('password')} type={showPwd ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-11 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={mutation.isPending}
            className="w-full py-2.5 px-4 bg-blue-500 hover:bg-blue-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 mt-2">
            {mutation.isPending ? <><Loader2 size={15} className="animate-spin" />Signing in…</> : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-slate-600 text-xs mt-6">ARY Services · Authorized personnel only</p>
      </div>
    </div>
  )
}
