import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlowCard } from '../components/ui/GlowCard'
import { LiveBadge } from '../components/ui/LiveBadge'
import { NeonButton } from '../components/ui/NeonButton'
import { useFantasyStore } from '../store/useFantasyStore'
import { ROUND_CONFIGS } from '../types/fantasy'
import type { RoundScore } from '../types/fantasy'
import { useLiveFantasyScoring } from '../hooks/useLiveFantasyScoring'
import { standardRules } from '../scoring/rules/standardRules'

const SCORING_RULES = [
  { stat: 'Points',    pts: '+1.0', positive: true  },
  { stat: 'Rebounds',  pts: '+1.0', positive: true  },
  { stat: 'Assists',   pts: '+1.5', positive: true  },
  { stat: 'Steals',    pts: '+2.0', positive: true  },
  { stat: 'Blocks',    pts: '+2.0', positive: true  },
  { stat: 'Turnovers', pts: '-2.0', positive: false },
  { stat: 'Fouls',     pts: '-1.0', positive: false },
]

const STAT_ORDER = standardRules.rules.map(r => r.stat)

// ─── Locked Round Card (expandable) ──────────────────────────────────────────

function LockedRoundCard({ round }: { round: RoundScore }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-[#2C2C2C] overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#161616] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {round.roundLabel}
          </span>
          <span className="text-[10px] text-slate-600">
            {new Date(round.lockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#FFD100] tabular-nums">
            {round.totalPoints.toFixed(1)} pts
          </span>
          <span className="text-slate-500 text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#2C2C2C] bg-[#0C0C0C]">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] text-slate-600 uppercase border-b border-[#1C1C1C]">
                  <th className="text-left pl-3 pr-1 py-2">Player</th>
                  <th className="text-right px-1 py-2">PTS</th>
                  <th className="text-right px-1 py-2">REB</th>
                  <th className="text-right px-1 py-2">AST</th>
                  <th className="text-right px-1 py-2">STL</th>
                  <th className="text-right px-1 py-2">BLK</th>
                  <th className="text-right px-1 py-2 text-red-900">TO</th>
                  <th className="text-right px-1 py-2 text-red-900">PF</th>
                  <th className="text-right pl-1 pr-3 py-2 text-[#FFD100]">FPts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161616]">
                {round.players.map(p => {
                  const s = p.stats
                  return (
                    <tr key={p.playerId} className="hover:bg-[#161616] transition-colors">
                      <td className="pl-3 pr-1 py-2">
                        <div className="font-medium text-white">{p.playerName}</div>
                        <div className="text-[10px] text-slate-600">
                          {p.teamAbbr} · {p.position}
                          {p.isActual && <span className="ml-1 text-green-500">● actual</span>}
                        </div>
                      </td>
                      {s ? (
                        STAT_ORDER.map(stat => {
                          const val = (s as unknown as Record<string, number>)[stat] ?? 0
                          const rule = standardRules.rules.find(r => r.stat === stat)
                          const isNeg = (rule?.points ?? 0) < 0
                          return (
                            <td key={stat} className={`text-right px-1 py-2 tabular-nums ${isNeg && val > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                              {val}
                            </td>
                          )
                        })
                      ) : (
                        STAT_ORDER.map(stat => (
                          <td key={stat} className="text-right px-1 py-2 text-slate-600">—</td>
                        ))
                      )}
                      <td className="text-right pl-1 pr-3 py-2 font-bold text-[#FFD100] tabular-nums">
                        {p.fantasyPoints.toFixed(1)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#2C2C2C]">
                  <td colSpan={8} className="pl-3 pr-1 pt-2 pb-3 text-[10px] text-slate-600">
                    {round.roundLabel} total
                  </td>
                  <td className="text-right pl-1 pr-3 pt-2 pb-3 font-bold text-[#FFD100] tabular-nums">
                    {round.totalPoints.toFixed(1)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function MyTeamPage() {
  const navigate = useNavigate()
  const { draftedPlayers, currentRound, getSlots, roundHistory, lockRound, resetSeason, cumulativePoints, rosterLocked } = useFantasyStore()
  const config = ROUND_CONFIGS.find(r => r.roundNumber === currentRound) ?? ROUND_CONFIGS[0]
  const slots = getSlots()
  const [confirmReset, setConfirmReset] = useState(false)
  const [locking, setLocking] = useState(false)

  const { scores, loading } = useLiveFantasyScoring(draftedPlayers, currentRound)

  const hasLive   = Array.from(scores.values()).some(s => s.isLive)
  const hasActual = Array.from(scores.values()).some(s => s.isActual)

  // Only count actual/live stats toward the season total — never projections
  const actualCurrentTotal = Array.from(scores.values())
    .filter(s => s.isActual)
    .reduce((sum, s) => sum + s.fantasyPoints, 0)

  const cumulative   = cumulativePoints()
  const seasonTotal  = cumulative + (loading ? 0 : actualCurrentTotal)
  const STAT_HEADERS = ['PTS', 'REB', 'AST', 'STL', 'BLK', 'TO', 'PF']

  function handleLockRound() {
    setLocking(true)
    lockRound(scores)
    setTimeout(() => setLocking(false), 500)
  }

  return (
    <div className="space-y-6">

      {/* ── Season Overview ─────────────────────────────────────────── */}
      <GlowCard glowColor="#FFD10033">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Season Total</div>
            <div className="text-3xl font-bold text-white tabular-nums">
              {seasonTotal.toFixed(1)} pts
            </div>
            {hasLive && (
              <div className="mt-1">
                <LiveBadge />
              </div>
            )}
          </div>

          {/* All-rounds breakdown */}
          <div className="flex flex-col gap-1 shrink-0 min-w-[130px]">
            {ROUND_CONFIGS.map(rc => {
              const locked = roundHistory.find(r => r.roundId === rc.roundNumber)
              const isCurrent = rc.roundNumber === currentRound
              const isFuture  = rc.roundNumber > currentRound && !locked

              const pts = locked
                ? locked.totalPoints
                : isCurrent
                  ? (loading ? null : actualCurrentTotal)
                  : null

              return (
                <div key={rc.roundNumber} className="flex items-center justify-between gap-4 text-xs">
                  <span className={locked ? 'text-slate-400' : isCurrent ? 'text-slate-300' : 'text-slate-700'}>
                    {rc.label}
                  </span>
                  <span className={`font-bold tabular-nums ${
                    locked ? 'text-[#FFD100]' :
                    isCurrent && pts !== null ? (hasLive ? 'text-green-400' : 'text-slate-300') :
                    'text-slate-700'
                  }`}>
                    {pts !== null ? `${pts.toFixed(1)}` : isFuture ? '—' : '…'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </GlowCard>

      {/* ── Current Round ───────────────────────────────────────────── */}
      <GlowCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold text-white">{config.label} Roster</div>
            {hasActual && (
              <div className="text-[10px] text-slate-500 mt-0.5">
                {hasLive ? 'Live ESPN stats' : 'Final game stats'} · 30s refresh
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {!rosterLocked && <NeonButton size="sm" onClick={() => navigate('/draft')}>Edit Draft →</NeonButton>}
            {draftedPlayers.length > 0 && (
              <button
                onClick={handleLockRound}
                disabled={locking}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#FFD10044] bg-[#FFD10011] text-[#FFD100] hover:bg-[#FFD10022] transition-colors disabled:opacity-50"
              >
                {locking ? 'Locking…' : '🔒 Lock Round'}
              </button>
            )}
          </div>
        </div>

        {draftedPlayers.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">🏀</div>
            <div className="text-slate-400 mb-4">No players drafted for {config.label}</div>
            <NeonButton onClick={() => navigate('/draft')}>Go to Draft →</NeonButton>
          </div>
        ) : (
          <div className="space-y-2">
            {slots.map(({ slot, drafted }) => {
              const score = drafted ? scores.get(drafted.player.id) : null
              return (
                <div key={slot} className={`rounded-lg border p-3 flex items-center gap-3 ${
                  drafted ? 'border-[#FFD10022] bg-[#FFD10006]' : 'border-[#2C2C2C] border-dashed opacity-60'
                }`}>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider w-8 shrink-0">{slot}</div>
                  {drafted ? (
                    <>
                      <img
                        src={drafted.player.photoUrl}
                        alt={drafted.player.fullName}
                        className="w-9 h-9 rounded-full object-cover bg-[#2C2C2C] shrink-0"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(drafted.player.fullName)}&backgroundColor=161616&textColor=FFD100`
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white">{drafted.player.fullName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          {drafted.player.teamAbbr} · {drafted.player.position}
                          {score?.isLive && <LiveBadge />}
                          {score?.isActual && !score.isLive && <span className="text-[10px] text-[#FFD100]">FINAL</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-1">
                        <div className="text-[10px] text-slate-500">
                          {score?.isActual ? (score.isLive ? 'Live' : 'Actual') : 'Proj'}
                        </div>
                        <div className={`text-sm font-bold tabular-nums ${
                          score?.isLive ? 'text-green-400' : score?.isActual ? 'text-[#FFD100]' : 'text-slate-600'
                        }`}>
                          {(score?.fantasyPoints ?? 0).toFixed(1)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-slate-600 italic">No player drafted</div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Score breakdown table */}
        {draftedPlayers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#2C2C2C]">
            <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Stat Breakdown</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] text-slate-600 uppercase">
                    <th className="text-left pb-1.5">Player</th>
                    {STAT_HEADERS.map(h => (
                      <th key={h} className={`text-right pb-1.5 ${h === 'TO' || h === 'PF' ? 'text-red-900' : ''}`}>{h}</th>
                    ))}
                    <th className="text-right pb-1.5 text-[#FFD100]">FPts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161616]">
                  {draftedPlayers.map(({ player }) => {
                    const score = scores.get(player.id)
                    const s = score?.stats
                    const vals = s ? STAT_ORDER.map(stat => (s as unknown as Record<string, number>)[stat] ?? 0) : null
                    return (
                      <tr key={player.id} className="hover:bg-[#161616] transition-colors">
                        <td className="py-1.5 pr-2">
                          <div className="font-medium text-white">{player.fullName}</div>
                          <div className="text-[10px] text-slate-600">
                            {player.teamAbbr}
                            {score?.isLive && <span className="ml-1 text-green-400">●</span>}
                            {score?.isActual && !score.isLive && <span className="ml-1 text-[#FFD10088]">✓</span>}
                          </div>
                        </td>
                        {vals ? vals.map((val, i) => {
                          const rule = standardRules.rules[i]
                          return (
                            <td key={rule.stat} className={`text-right py-1.5 tabular-nums ${rule.points < 0 && val > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                              {val}
                            </td>
                          )
                        }) : STAT_ORDER.map(stat => (
                          <td key={stat} className="text-right py-1.5 text-slate-600">—</td>
                        ))}
                        <td className={`text-right py-1.5 font-bold tabular-nums ${score?.isActual ? 'text-[#FFD100]' : 'text-slate-600'}`}>
                          {(score?.fantasyPoints ?? 0).toFixed(1)}
                          {!score?.isActual && <span className="text-[9px] text-slate-700 ml-0.5">proj</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#2C2C2C]">
                    <td colSpan={8} className="pt-1.5 text-[10px] text-slate-600">{config.label} actual</td>
                    <td className="text-right pt-1.5 font-bold text-[#FFD100] tabular-nums">{actualCurrentTotal.toFixed(1)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </GlowCard>

      {/* ── Round History ───────────────────────────────────────────── */}
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Round Scores</div>
        <div className="space-y-2">
          {ROUND_CONFIGS.map(rc => {
            const locked = roundHistory.find(r => r.roundId === rc.roundNumber)
            const isCurrent = rc.roundNumber === currentRound && !locked

            if (locked) {
              return <LockedRoundCard key={rc.roundNumber} round={locked} />
            }

            // Current or future round — non-expandable row
            return (
              <div
                key={rc.roundNumber}
                className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
                  isCurrent ? 'border-[#FFD10022]' : 'border-[#1C1C1C]'
                }`}
              >
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  isCurrent ? 'text-white' : 'text-slate-700'
                }`}>
                  {rc.label}
                </span>
                <span className={`text-sm font-bold tabular-nums ${
                  isCurrent && hasLive ? 'text-green-400' :
                  isCurrent ? 'text-slate-400' :
                  'text-slate-700'
                }`}>
                  {isCurrent
                    ? (loading ? '…' : `${actualCurrentTotal.toFixed(1)} pts`)
                    : '—'
                  }
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Scoring Rules ───────────────────────────────────────────── */}
      <GlowCard>
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Scoring Rules</div>
        <div className="grid grid-cols-2 gap-2">
          {SCORING_RULES.map(r => (
            <div key={r.stat} className="flex items-center justify-between bg-[#0C0C0C] rounded-lg px-3 py-2">
              <span className="text-sm text-slate-300">{r.stat}</span>
              <span className={`text-sm font-semibold ${r.positive ? 'text-[#FFD100]' : 'text-red-400'}`}>
                {r.pts} pts
              </span>
            </div>
          ))}
        </div>
      </GlowCard>

      {/* ── Reset Season ───────────────────────────────────────────── */}
      <div className="flex justify-center pb-2">
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            Reset Season
          </button>
        ) : (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Clear all round history?</span>
            <button
              onClick={() => { resetSeason(); setConfirmReset(false) }}
              className="text-red-400 font-semibold hover:text-red-300"
            >
              Yes, reset
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
