import { motion } from 'framer-motion'

interface PlayerStatRowProps {
  label: string
  value: number
  max: number
  color?: string
  suffix?: string
}

export function PlayerStatRow({ label, value, max, color = '#FFD100', suffix = '' }: PlayerStatRowProps) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#2C2C2C] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
      <span className="text-xs font-semibold text-white w-12 text-right">
        {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}{suffix}
      </span>
    </div>
  )
}
