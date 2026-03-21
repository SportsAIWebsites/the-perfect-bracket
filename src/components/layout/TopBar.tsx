import { useState } from 'react'
import { LiveBadge } from '../ui/LiveBadge'
import { AuthModal } from '../auth/AuthModal'
import { UserMenu } from '../auth/UserMenu'
import { useAuth } from '../../hooks/useAuth'

interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps) {
  const { user, signOut } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <header className="h-14 bg-[#090909]/80 backdrop-blur border-b border-[#161616] flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-base font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-3">
        <LiveBadge />
        <div className="text-xs text-slate-500">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        {user ? (
          <UserMenu user={user} onSignOut={signOut} />
        ) : (
          <button
            onClick={() => setAuthOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#FFD10022] border border-[#FFD10044] text-[#FFD100] text-xs font-semibold hover:bg-[#FFD10033] transition-colors"
          >
            Sign In
          </button>
        )}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  )
}
