import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockPlayers } from '../mock'
import type { Player } from '../types/player'
import type { PositionSlot } from '../types/fantasy'
import { PlayerCard } from '../components/player/PlayerCard'
import { PlayerModal } from '../components/player/PlayerModal'
import { ROUND_CONFIGS, canFillSlot } from '../types/fantasy'
import { useFantasyStore } from '../store/useFantasyStore'
import { scoringEngine } from '../scoring/engine'

import { useEliminatedTeams } from '../hooks/useEliminatedTeams'
import { isPlayerEligible } from '../utils/tournamentEligibility'
import { useLiveScores } from '../hooks/useLiveScores'

const SLOT_LABELS: Record<string, string> = {
  G1: 'Guard', G2: 'Guard', G3: 'Guard',
  FC1: 'Fwd / Ctr', FC2: 'Fwd / Ctr',
  G: 'Guard', F: 'Forward', C: 'Center', FC: 'Fwd/Ctr', FLEX: 'Flex',
}

const SLOT_POSITION_LABEL: Record<string, string> = {
  G1: 'G', G2: 'G', G3: 'G',
  FC1: 'F/C', FC2: 'F/C',
}

export function DraftRoomPage() {
  const navigate = useNavigate()
  const [activeSlot, setActiveSlot] = useState<PositionSlot | null>(null)
  const [search, setSearch] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  const { currentRound, draftedPlayers, draft, drop, getSlots, isDrafted, rosterLocked, lockRoster } = useFantasyStore()
  const config = ROUND_CONFIGS.find(r => r.roundNumber === currentRound) ?? ROUND_CONFIGS[0]
  const slots = getSlots()
  const { games: liveGames } = useLiveScores()
  const gamesStarted = liveGames.some(g => g.status === 'in_progress' || g.status === 'final')
  const locked = rosterLocked || gamesStarted
  const rosterComplete = draftedPlayers.length === config.slotCount

  const eliminatedTeamIds = useEliminatedTeams()

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
    if (locked || rosterLocked || alreadyDrafted) return
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

  // Redirect if locked
  if (locked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-6xl">🔒</div>
        <h2 className="text-2xl font-black text-white">Draft is Locked</h2>
        <p className="text-slate-400">The roster locked at tip-off. Check back for the next round.</p>
        <button
          onClick={() => navigate('/draft')}
          className="mt-2 px-6 py-3 rounded-xl bg-[#FFD10022] border border-[#FFD10044] text-[#FFD100] font-bold hover:bg-[#FFD10033] transition-colors cursor-pointer"
        >
          ← Back to Draft
        </button>
      </div>
    )
  }

  const guardSlots = slots.filter(s => s.slot.startsWith('G'))
  const fcSlots = slots.filter(s => s.slot.startsWith('FC'))

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -mt-6 -mx-6">
      {/* ── TOP BAR ── */}
      <div className="flex items-center gap-4 px-6 py-3 bg-[#0C0C0C] border-b border-[#2C2C2C] shrink-0">
        <button
          onClick={() => navigate('/draft')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <div className="w-px h-5 bg-[#2C2C2C]" />
        <div className="font-bold text-white text-sm">{config.label} Draft Room</div>
        <div className="flex-1" />
        {locked ? (
          <span className="text-xs font-bold text-red-400 bg-red-400/10 px-3 py-1 rounded-full">🔒 Draft Locked</span>
        ) : (
          <span className="text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">● Draft Open</span>
        )}
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">

          {/* ── ROSTER SLOTS ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-black text-white">My Roster</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {draftedPlayers.length}/{config.slotCount} drafted · Click an empty slot to pick a player
                </p>
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
                  locked={locked || rosterLocked}
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
                  locked={locked || rosterLocked}
                  onClick={() => handleSlotClick(slot, !!drafted)}
                  onDrop={() => drop(drafted!.player.id)}
                />
              ))}
            </div>

            {/* ── Lock In button ── */}
            {rosterComplete && !rosterLocked && (
              <button
                onClick={lockRoster}
                className="mt-4 w-full py-4 rounded-2xl font-black text-base uppercase tracking-widest text-black cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #FFD100 0%, #FF9500 100%)',
                  boxShadow: '0 0 32px #FFD10055, 0 4px 16px #FF950044',
                }}
              >
                🔒 Lock In Roster
              </button>
            )}

            {/* ── Locked state ── */}
            {rosterLocked && (
              <div
                className="mt-4 w-full py-4 rounded-2xl text-center"
                style={{
                  background: 'linear-gradient(135deg, #FFD10015 0%, #FF950015 100%)',
                  border: '1px solid #FFD10044',
                }}
              >
                <div className="text-[#FFD100] font-black text-base uppercase tracking-widest">✓ Roster Locked In</div>
                <div className="text-slate-500 text-xs mt-1">Your picks are set for {config.label}</div>
              </div>
            )}
          </div>

          {/* ── PLAYER PICKER ── */}
          <div ref={pickerRef}>
            {activeSlot && !locked && !rosterLocked ? (
              <div className="bg-[#161616] border border-[#FFD10033] rounded-2xl overflow-hidden">
                {/* Picker header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#2C2C2C]">
                  <div>
                    <div className="text-sm font-bold text-white">{activeSlot} · {SLOT_LABELS[activeSlot]}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{eligiblePlayers.length} available players</div>
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

                {/* Player grid */}
                <div className="p-4">
                  {eligiblePlayers.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm">No players match your search</div>
                  ) : (
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                      {eligiblePlayers.map(player => (
                        <PlayerCard
                          key={player.id}
                          player={player}
                          onClick={setSelectedPlayer}
                          onDraft={handleDraft}
                          isDrafted={false}
                          canDraft={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : !rosterComplete ? (
              <div className="rounded-2xl border-2 border-dashed border-[#2C2C2C] flex items-center justify-center py-12 text-slate-600 text-sm">
                Click an empty slot above to browse players
              </div>
            ) : null}
          </div>


        </div>
      </div>

      <PlayerModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        onDraft={handleDraft}
        isDrafted={selectedPlayer ? isDrafted(selectedPlayer.id) : false}
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
        <div className="text-sm text-slate-500 font-medium">+ Add Player</div>
      </div>
    </button>
  )
}
