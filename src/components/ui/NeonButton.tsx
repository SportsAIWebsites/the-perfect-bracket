import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'cyan' | 'orange' | 'magenta' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function NeonButton({ children, variant = 'cyan', size = 'md', className = '', ...props }: NeonButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed'

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variants = {
    cyan:    'bg-[#FFD10022] text-[#FFD100] border border-[#FFD10044] hover:bg-[#FFD10033] hover:border-[#FFD10088] hover:shadow-[0_0_12px_#FFD10044]',
    orange:  'bg-[#ff6b3522] text-[#ff6b35] border border-[#ff6b3544] hover:bg-[#ff6b3533] hover:border-[#ff6b3588] hover:shadow-[0_0_12px_#ff6b3544]',
    magenta: 'bg-[#ffffff22] text-[#ffffff] border border-[#ffffff44] hover:bg-[#ffffff33] hover:border-[#ffffff88] hover:shadow-[0_0_12px_#ffffff44]',
    ghost:   'bg-transparent text-slate-400 border border-[#2C2C2C] hover:text-white hover:border-slate-500',
  }

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
