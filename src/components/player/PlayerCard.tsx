import type { Player } from '../../types/player'
import { mockTeams } from '../../mock/teams'
import { NeonButton } from '../ui/NeonButton'

interface PlayerCardProps {
  player: Player
  onClick: (player: Player) => void
  onDraft?: (player: Player) => void
  isDrafted?: boolean
  canDraft?: boolean
  variant?: 'grid' | 'compact'
  /** Override the stat display. Pass 1 item for a single centered stat, 3 for the full grid. */
  customStats?: { label: string; value: string }[]
}

export function PlayerCard({ player, onClick, onDraft, isDrafted, canDraft = true, variant = 'grid', customStats }: PlayerCardProps) {
  const team = mockTeams.find(t => t.id === player.teamId)
  const primaryColor = team?.colors.primary ?? '#FFD100'

  if (variant === 'compact') {
    return (
      <div
        onClick={() => onClick(player)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#161616] border border-[#2C2C2C] hover:border-[#2C2C2C]/60 cursor-pointer transition-all hover:bg-[#2C2C2C]"
      >
        <img
          src={player.photoUrl}
          alt={player.fullName}
          className="w-8 h-8 rounded-full object-cover bg-[#2C2C2C]"
          onError={e => {
            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(player.fullName)}&backgroundColor=161616&textColor=FFD100`
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{player.fullName}</div>
          <div className="text-[10px] text-slate-500">{player.position} · {player.teamAbbr}</div>
        </div>
        <div className="text-xs font-bold text-[#FFD100]">{player.stats.ppg.toFixed(1)} PPG</div>
      </div>
    )
  }

  return (
    <div
      className="bg-[#161616] border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg group"
      style={{
        borderColor: isDrafted ? `${primaryColor}66` : '#2C2C2C',
        boxShadow: isDrafted ? `0 0 16px ${primaryColor}22` : undefined,
      }}
      onClick={() => onClick(player)}
    >
      {/* Team color accent */}
      <div className="h-1 w-full" style={{ backgroundColor: primaryColor }} />

      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative shrink-0">
            <img
              src={player.photoUrl}
              alt={player.fullName}
              className="w-14 h-14 rounded-xl object-cover bg-[#2C2C2C]"
              onError={e => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(player.fullName)}&backgroundColor=161616&textColor=FFD100`
              }}
            />
            {player.isInjured && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold">!</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
                style={{ backgroundColor: `${primaryColor}22`, color: primaryColor }}>
                {player.position}
              </span>
            </div>
            <div className="text-sm font-bold text-white leading-tight">{player.fullName}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {player.teamAbbr} · Seed {player.seed} · {player.year}
            </div>
          </div>

        </div>

        {/* Stats */}
        {customStats?.length === 1 ? (
          // Single leading stat — clean centered display
          <div className="bg-[#0C0C0C] rounded-lg p-3 text-center mb-3">
            <div className="text-2xl font-black text-white">{customStats[0].value}</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{customStats[0].label}</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {(customStats ?? [
              { label: 'PPG', value: player.stats.ppg.toFixed(1) },
              { label: 'RPG', value: player.stats.rpg.toFixed(1) },
              { label: 'APG', value: player.stats.apg.toFixed(1) },
            ]).map((s, i) => (
              <div key={i} className="bg-[#0C0C0C] rounded-lg p-2 text-center">
                <div className="text-sm font-bold text-white">{s.value}</div>
                <div className="text-[9px] text-slate-600 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Draft button */}
        {onDraft && (
          <NeonButton
            variant={isDrafted ? 'ghost' : 'cyan'}
            size="sm"
            className="w-full"
            onClick={e => {
              e.stopPropagation()
              if (!isDrafted && canDraft) onDraft(player)
            }}
            disabled={isDrafted || !canDraft}
          >
            {isDrafted ? '✓ Drafted' : !canDraft ? 'Slots Full' : '+ Draft Player'}
          </NeonButton>
        )}
      </div>
    </div>
  )
}
