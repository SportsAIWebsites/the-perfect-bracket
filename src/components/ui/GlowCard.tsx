import type { ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
  onClick?: () => void
  hoverable?: boolean
}

export function GlowCard({ children, className = '', glowColor, onClick, hoverable = false }: GlowCardProps) {
  const style = glowColor ? { '--glow': glowColor } as React.CSSProperties : undefined

  return (
    <div
      onClick={onClick}
      className={[
        'bg-[#161616] border border-[#2C2C2C] rounded-xl p-4',
        hoverable && 'cursor-pointer transition-all duration-200 hover:border-[#FFD10044] hover:translate-y-[-2px]',
        glowColor && 'hover:shadow-[0_0_16px_var(--glow)]',
        onClick && 'cursor-pointer',
        className,
      ].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </div>
  )
}
