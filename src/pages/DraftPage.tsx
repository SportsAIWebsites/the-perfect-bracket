import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockPlayers, mockGames } from '../mock'
import type { Player } from '../types/player'
import type { PositionSlot } from '../types/fantasy'
import { PlayerCard } from '../components/player/PlayerCard'
import { PlayerModal } from '../components/player/PlayerModal'
import { ROUND_CONFIGS, canFillSlot } from '../types/fantasy'
import { useFantasyStore } from '../store/useFantasyStore'
import { scoringEngine } from '../scoring/engine'
import { useEliminatedTeams } from '../hooks/useEliminatedTeams'
import { isPlayerEligible } from '../utils/tournamentEligibility'

function getRoundLockTime(): Date {
  const scheduled = mockGames
    .filter(g => g.status === 'scheduled')
    .map(g => new Date(g.scheduledAt))
    .sort((a, b) => a.getTime() - b.getTime())
  return scheduled[0] ?? new Date(0)
}

const ROUND_LOCK_TIME = getRoundLockTime()

const SLOT_LABELS: Record<string, string> = {
  G1: 'Guard', G2: 'Guard', G3: 'Guard',
  FC1: 'Fwd / Ctr', FC2: 'Fwd / Ctr',
  G: 'Guard', F: 'Forward', C: 'Center', FC: 'Fwd/Ctr', FLEX: 'Flex',
}

const SLOT_POSITION_LABEL: Record<string, string> = {
  G1: 'G', G2: 'G', G3: 'G',
  FC1: 'F/C', FC2: 'F/C',
}

export function DraftPage() {
  const navigate = useNavigate()
  const [activeSlot, setActiveSlot] = useState<PositionSlot | null>(null)
  const [search, setSearch] = useState('')
  const [previewPlayer, setPreviewPlayer] = useState<Player | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  const { currentRound, draftedPlayers, draft, drop, getSlots, isDrafted, rosterLocked } = useFantasyStore()
  const config = ROUND_CONFIGS.find(r => r.roundNumber === currentRound) ?? ROUND_CONFIGS[0]
  const slots = getSlots()

  const locked = rosterLocked || Date.now() >= ROUND_LOCK_TIME.getTime()
  const rosterComplete = draftedPlayers.length === config.slotCount
  const eliminatedTeamIds = useEliminatedTeams()

  // Players eligible for the active slot
  const eligiblePlayers = useMemo(() => {
    if (!activeSlot) return []
    return mockPlayers
      .filter(p => isPlayerEligible(p, eliminatedTeamIds))
      .filter(p => canFillSlot(activeSlot, p.positionGroup))
      .filter(p => !isDrafted(p.id))
      .filter(p =>
        search === '' ||
        p.fullName.toLowerCase().includes(search.toLowerCase()) ||
        p.teamName.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => b.fantasyValue - a.fantasyValue)
  }, [activeSlot, search, draftedPlayers, isDrafted, eliminatedTeamIds])

  const projectedScore = useMemo(() => {
    return draftedPlayers.reduce((sum, { player }) => {
      const result = scoringEngine.projectFromAverages(player.id, currentRound, player.stats)
      return sum + result.totalPoints
    }, 0)
  }, [draftedPlayers, currentRound])

  function handleSlotClick(slot: PositionSlot, alreadyDrafted: boolean) {
    if (locked) return
    if (alreadyDrafted) return
    setActiveSlot(slot === activeSlot ? null : slot)
    setSearch('')
    setTimeout(() => pickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function handleDraft(player: Player) {
    const ok = draft(player)
    if (ok) {
      setActiveSlot(null)
      setSearch('')
    }
  }

  const guardSlots = slots.filter(s => s.slot.startsWith('G'))
  const fcSlots    = slots.filter(s => s.slot.startsWith('FC'))

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* ── HERO ── */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[#FFD10033]"
        style={{ background: '#0C0C0C', boxShadow: '0 0 50px #FFD10014' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 160% at 50% -20%, #FFD10016 0%, transparent 65%)' }}
        />
        <div className="relative p-6 space-y-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Draft Your <span className="text-[#FFD100]">{config.label}</span> Roster
            </h1>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {locked ? (
              <div className="relative px-10 py-4 rounded-xl font-black text-white text-xl uppercase tracking-widest bg-red-500/20 border border-red-500/40 flex items-center gap-2">
                <span>🔒 Draft Locked</span>
              </div>
            ) : (
              <button
                onClick={() => navigate('/draft/room')}
                className="relative group px-10 py-4 rounded-xl font-black text-black text-xl uppercase tracking-widest transition-all duration-200 cursor-pointer select-none shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #FFD100 0%, #FF9500 100%)',
                  boxShadow: '0 0 28px #FFD10066, 0 0 56px #FFD10022, 0 4px 16px rgba(0,0,0,0.5)',
                }}
              >
                <span className="relative z-10 flex items-center gap-2">⚡ DRAFT NOW</span>
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ background: 'linear-gradient(135deg, #FFE44D 0%, #FFAA00 100%)' }}
                />
              </button>
            )}

          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">{draftedPlayers.length} of {config.slotCount} slots filled</span>
              <span className="text-xs font-semibold" style={{ color: rosterComplete ? '#FFD100' : '#64748b' }}>
                {rosterComplete ? 'Good luck!' : `${config.slotCount - draftedPlayers.length} remaining`}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#2C2C2C] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(draftedPlayers.length / config.slotCount) * 100}%`,
                  background: 'linear-gradient(90deg, #FFD100, #FF9500)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── ROSTER SLOTS ── */}
      <div ref={pickerRef}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-black text-white">My Roster</h2>
            <p className="text-xs text-slate-500 mt-0.5">3 Guards · 2 Fwd/Center · Click an empty slot to add a player</p>
          </div>
          {draftedPlayers.length > 0 && (
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Projected / Game</div>
              <div className="text-lg font-bold text-[#FFD100]">~{projectedScore.toFixed(1)} pts</div>
            </div>
          )}
        </div>

        {/* Guard slots — 3 columns */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {guardSlots.map(({ slot, drafted }) => (
            <SlotCard
              key={slot}
              slot={slot}
              label={SLOT_LABELS[slot]}
              posLabel={SLOT_POSITION_LABEL[slot]}
              drafted={drafted?.player ?? null}
              isActive={activeSlot === slot}
              locked={locked}
              onClick={() => handleSlotClick(slot, !!drafted)}
              onDrop={() => drop(drafted!.player.id)}
            />
          ))}
        </div>

        {/* FC slots — 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          {fcSlots.map(({ slot, drafted }) => (
            <SlotCard
              key={slot}
              slot={slot}
              label={SLOT_LABELS[slot]}
              posLabel={SLOT_POSITION_LABEL[slot]}
              drafted={drafted?.player ?? null}
              isActive={activeSlot === slot}
              locked={locked}
              onClick={() => handleSlotClick(slot, !!drafted)}
              onDrop={() => drop(drafted!.player.id)}
            />
          ))}
        </div>
      </div>

      {/* ── PLAYER PICKER ── */}
      {activeSlot && !locked && (
        <div className="bg-[#161616] border border-[#FFD10033] rounded-2xl overflow-hidden">
          {/* Picker header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2C2C2C]">
            <div>
              <div className="text-[10px] text-[#FFD100] uppercase tracking-widest font-bold mb-0.5">
                Selecting for {activeSlot} — {SLOT_LABELS[activeSlot]}
              </div>
              <div className="text-sm text-slate-400">{eligiblePlayers.length} available players</div>
            </div>
            <button
              onClick={() => setActiveSlot(null)}
              className="w-8 h-8 rounded-lg bg-[#2C2C2C] text-slate-400 hover:text-white hover:bg-[#3C3C3C] flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <div className="px-5 py-3 border-b border-[#2C2C2C]">
            <input
              type="text"
              placeholder="Search players or teams..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              className="w-full bg-[#0C0C0C] border border-[#2C2C2C] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FFD10044]"
            />
          </div>

          {/* Player list */}
          <div className="overflow-y-auto max-h-[60vh] p-4">
            {eligiblePlayers.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">No players match your search</div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {eligiblePlayers.map(player => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onClick={setPreviewPlayer}
                    onDraft={handleDraft}
                    isDrafted={false}
                    canDraft={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <PlayerModal
        player={previewPlayer}
        onClose={() => setPreviewPlayer(null)}
        onDraft={handleDraft}
        isDrafted={previewPlayer ? isDrafted(previewPlayer.id) : false}
      />
    </div>
  )
}

// ── Slot Card component ───────────────────────────────────────────────────────
interface SlotCardProps {
  slot: PositionSlot
  label: string
  posLabel: string
  drafted: Player | null
  isActive: boolean
  locked: boolean
  onClick: () => void
  onDrop: () => void
}

function SlotCard({ slot, label, posLabel, drafted, isActive, locked, onClick, onDrop }: SlotCardProps) {
  if (drafted) {
    return (
      <div className="relative bg-[#161616] border border-[#FFD10033] rounded-xl p-4">
        <div className="text-[9px] text-[#FFD100] uppercase tracking-widest font-bold mb-2">
          {slot} · {label}
        </div>
        <div className="flex items-center gap-2">
          <img
            src={drafted.photoUrl}
            alt={drafted.fullName}
            className="w-10 h-10 rounded-full object-cover bg-[#2C2C2C] shrink-0"
            onError={e => {
              (e.target as HTMLImageElement).src =
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(drafted.fullName)}&backgroundColor=161616&textColor=FFD100`
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">{drafted.fullName}</div>
            <div className="text-[10px] text-slate-500">{drafted.teamAbbr} · {drafted.stats.ppg.toFixed(1)} ppg</div>
          </div>
        </div>
        {!locked && (
          <button
            onClick={e => { e.stopPropagation(); onDrop() }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#2C2C2C] text-slate-500 hover:text-red-400 hover:bg-red-400/10 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={`w-full text-left rounded-xl border-2 border-dashed p-4 transition-all duration-150 ${
        locked
          ? 'border-[#2C2C2C] cursor-not-allowed opacity-50'
          : isActive
          ? 'border-[#FFD10066] bg-[#FFD10008] cursor-pointer'
          : 'border-[#2C2C2C] hover:border-[#FFD10033] hover:bg-[#FFD10005] cursor-pointer'
      }`}
    >
      <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-3">
        {slot} · {label}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-[#2C2C2C] flex items-center justify-center shrink-0">
          <span className="text-xs font-black text-slate-500">{posLabel}</span>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {locked ? 'Locked' : '+ Add Player'}
        </div>
      </div>
    </button>
  )
}
