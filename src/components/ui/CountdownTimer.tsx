import { useState, useEffect } from 'react'

interface Props {
  lockAt: Date
  label?: string
}

function getTimeLeft(lockAt: Date) {
  return Math.max(0, Math.floor((lockAt.getTime() - Date.now()) / 1000))
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function CountdownTimer({ lockAt, label = 'Draft locks in' }: Props) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(lockAt))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(lockAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [lockAt])

  const locked = timeLeft === 0
  const urgent = !locked && timeLeft < 3600 // < 1 hour

  if (locked) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
        <span className="text-red-400 text-lg">🔒</span>
        <div>
          <div className="text-red-400 font-bold text-sm uppercase tracking-wider">Draft Locked</div>
          <div className="text-red-500/70 text-xs">Roster locked at tip-off</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${
      urgent
        ? 'bg-red-500/10 border-red-500/40 animate-pulse-live'
        : 'bg-[#FFD10011] border-[#FFD10033]'
    }`}>
      <div className="text-2xl">⏱</div>
      <div>
        <div className={`text-xs uppercase tracking-wider font-semibold mb-0.5 ${urgent ? 'text-red-400' : 'text-[#FFD100]/70'}`}>
          {label}
        </div>
        <div className={`font-mono font-bold text-2xl tabular-nums leading-none ${
          urgent ? 'text-red-400' : 'text-[#FFD100]'
        }`}>
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  )
}
