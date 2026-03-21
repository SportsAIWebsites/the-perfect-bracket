import { NavLink } from 'react-router-dom'
import { useFantasyStore } from '../../store/useFantasyStore'
import { ROUND_CONFIGS } from '../../types/fantasy'

const navItems = [
  { to: '/',            label: 'Home',         icon: '🏠' },
  { to: '/bracket',     label: 'Bracket',      icon: '📊' },
  { to: '/draft',       label: 'Draft',        icon: '🏀' },
  { to: '/my-team',     label: 'My Team',      icon: '⭐' },
  { to: '/players',     label: 'Players',      icon: '👤' },
  { to: '/leaderboard', label: 'Leaderboard',  icon: '🏆' },
]

export function Sidebar() {
  const { currentRound, rosterLocked } = useFantasyStore()
  const roundConfig = ROUND_CONFIGS.find(r => r.roundNumber === currentRound) ?? ROUND_CONFIGS[0]

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-[#090909] border-r border-[#161616] flex flex-col z-40">
      {/* Logo */}
      <div className="p-4 border-b border-[#161616]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏀</span>
          <div>
            <div className="text-sm font-bold text-white leading-none">The Perfect</div>
            <div className="text-xs font-bold text-[#FFD100] text-glow-yellow leading-none">BRACKET</div>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-slate-500 uppercase tracking-wider">2026 Tournament</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#FFD10015] text-[#FFD100] border border-[#FFD10030]'
                  : 'text-slate-400 hover:text-white hover:bg-[#161616]'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Round indicator */}
      <div className="p-3 border-t border-[#161616]">
        <div className="bg-[#161616] rounded-lg p-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Current Round</div>
          <div className="text-sm font-bold text-white">{roundConfig.label}</div>
          <div className="text-xs text-[#FFD100] mt-0.5">
            {rosterLocked ? 'Roster Locked' : 'Draft Open'}
          </div>
        </div>
      </div>
    </aside>
  )
}
