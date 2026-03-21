interface StatPillProps {
  label: string
  value: string | number
  color?: 'cyan' | 'orange' | 'magenta' | 'green' | 'default'
}

export function StatPill({ label, value, color = 'default' }: StatPillProps) {
  const colors = {
    cyan:    'bg-[#FFD10011] text-[#FFD100] border-[#FFD10033]',
    orange:  'bg-[#ff6b3511] text-[#ff6b35] border-[#ff6b3533]',
    magenta: 'bg-[#ffffff11] text-[#ffffff] border-[#ffffff33]',
    green:   'bg-[#00ff8811] text-[#00ff88] border-[#00ff8833]',
    default: 'bg-[#2C2C2C] text-slate-300 border-[#2e3250]',
  }
  return (
    <div className={`inline-flex flex-col items-center px-3 py-1.5 rounded-lg border text-center ${colors[color]}`}>
      <span className="text-lg font-bold leading-none">{value}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-70 mt-0.5">{label}</span>
    </div>
  )
}
