import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-3">
        <p className="text-8xl font-bold text-muted-foreground/20">404</p>
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">This page doesn't exist or you don't have access.</p>
        <button onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <ArrowLeft size={15} /> Back to Dashboard
        </button>
      </div>
    </div>
  )
}
