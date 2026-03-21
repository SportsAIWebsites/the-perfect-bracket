import { useState } from 'react'
import type { Player } from '../../types/player'
import { Modal } from '../ui/Modal'
import { PlayerStatRow } from './PlayerStatRow'
import { HighlightReel } from './HighlightReel'
import { NewsPanel } from './NewsPanel'
import { StatPill } from '../ui/StatPill'
import { NeonButton } from '../ui/NeonButton'

type Tab = 'stats' | 'gamelog' | 'highlights' | 'news'

interface PlayerModalProps {
  player: Player | null
  onClose: () => void
  onDraft?: (player: Player) => void
  isDrafted?: boolean
}

function heightStr(inches: number) {
  return `${Math.floor(inches / 12)}'${inches % 12}"`
}

export function PlayerModal({ player, onClose, onDraft, isDrafted }: PlayerModalProps) {
  const [tab, setTab] = useState<Tab>('stats')

  if (!player) return null

  const tabs: { id: Tab; label: string }[] = [
    { id: 'stats', label: 'Season Stats' },
    { id: 'highlights', label: 'Highlights' },
    { id: 'news', label: 'News' },
  ]

  return (
    <Modal open={!!player} onClose={onClose}>
      {/* Header */}
      <div className="relative p-6 border-b border-[#2C2C2C]" style={{ background: 'linear-gradient(135deg, #161616 0%, #0C0C0C 100%)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center">✕</button>

        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={player.photoUrl}
              alt={player.fullName}
              className="w-24 h-24 rounded-2xl object-cover bg-[#2C2C2C]"
              onError={e => {
                const el = e.target as HTMLImageElement
                el.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(player.fullName)}&backgroundColor=161616&textColor=FFD100`
              }}
            />
            <div className="absolute -bottom-1 -right-1 bg-[#0C0C0C] rounded-full px-1.5 py-0.5 text-[10px] font-bold text-slate-400 border border-[#2C2C2C]">
              #{player.jerseyNumber}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD10015] text-[#FFD100] border border-[#FFD10030] font-medium">
                {player.position}
              </span>
              <span className="text-[10px] text-slate-500">Seed {player.seed} · {player.region} Region</span>
            </div>
            <h2 className="text-2xl font-bold text-white">{player.fullName}</h2>
            <div className="text-sm text-slate-400 mt-1">
              {player.teamName} · {player.year} · {heightStr(player.heightIn)} · {player.weightLbs} lbs
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{player.hometown}</div>

            {/* Key stats */}
            <div className="flex gap-3 mt-3 flex-wrap">
              <StatPill label="PPG" value={player.stats.ppg.toFixed(1)} color="cyan" />
              <StatPill label="RPG" value={player.stats.rpg.toFixed(1)} color="orange" />
              <StatPill label="APG" value={player.stats.apg.toFixed(1)} color="magenta" />
              <StatPill label="FG%" value={`${(player.stats.fgPct * 100).toFixed(0)}%`} color="default" />
            </div>
          </div>

          {/* Fantasy value + draft button */}
          <div className="text-right shrink-0">
            <div className="text-[10px] text-slate-500 mb-1">Fantasy Value</div>
            <div className="text-3xl font-bold text-[#FFD100]">{player.fantasyValue}</div>
            <div className="text-[10px] text-slate-500 mb-3">/ 100</div>
            {onDraft && (
              <NeonButton
                variant={isDrafted ? 'ghost' : 'cyan'}
                size="sm"
                onClick={() => !isDrafted && onDraft(player)}
                disabled={isDrafted}
              >
                {isDrafted ? '✓ Drafted' : '+ Draft'}
              </NeonButton>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2C2C2C]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === t.id
                ? 'border-[#FFD100] text-[#FFD100]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6 max-h-[50vh] overflow-y-auto">
        {tab === 'stats' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">Season Averages ({player.stats.gamesPlayed} games)</div>
            <div className="space-y-3">
              <PlayerStatRow label="Points" value={player.stats.ppg} max={35} color="#FFD100" />
              <PlayerStatRow label="Rebounds" value={player.stats.rpg} max={15} color="#ff6b35" />
              <PlayerStatRow label="Assists" value={player.stats.apg} max={12} color="#ffffff" />
              <PlayerStatRow label="Steals" value={player.stats.spg} max={4} color="#00ff88" />
              <PlayerStatRow label="Blocks" value={player.stats.bpg} max={4} color="#00ff88" />
              <PlayerStatRow label="Turnovers" value={player.stats.tpg} max={6} color="#ffffff" />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#2C2C2C]">
              {[
                { l: 'FG%', v: `${(player.stats.fgPct * 100).toFixed(1)}%` },
                { l: '3P%', v: `${(player.stats.threePct * 100).toFixed(1)}%` },
                { l: 'FT%', v: `${(player.stats.ftPct * 100).toFixed(1)}%` },
                { l: 'MPG', v: player.stats.mpg.toFixed(1) },
                { l: '+/-', v: `${player.stats.plusMinus > 0 ? '+' : ''}${player.stats.plusMinus.toFixed(1)}` },
                { l: '3PM/G', v: player.stats.threesMadePg.toFixed(1) },
              ].map(s => (
                <div key={s.l} className="bg-[#0C0C0C] rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{s.v}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'highlights' && (
          <HighlightReel playerId={player.id} teamId={player.teamId} playerName={player.fullName} />
        )}

        {tab === 'news' && (
          <NewsPanel playerId={player.id} teamId={player.teamId} />
        )}
      </div>
    </Modal>
  )
}
