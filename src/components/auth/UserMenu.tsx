import { useState, useRef, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'

interface UserMenuProps {
  user: User
  onSignOut: () => void
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const initials = (user.email ?? 'U').slice(0, 1).toUpperCase()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD100] to-[#7c3aed] flex items-center justify-center text-sm font-bold text-white hover:opacity-90 transition-opacity"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-52 bg-[#161616] border border-[#2C2C2C] rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2C2C2C]">
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="text-sm text-white truncate">{user.email}</p>
          </div>
          <button
            onClick={() => { setOpen(false); onSignOut() }}
            className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-[#2C2C2C] transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
