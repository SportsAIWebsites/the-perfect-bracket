import { useState, useMemo } from 'react'
import { mockPlayers } from '../mock'
import type { Player } from '../types/player'
import { PlayerCard } from '../components/player/PlayerCard'
import { PlayerModal } from '../components/player/PlayerModal'
import { useTournamentStats, type TournamentPlayerStats } from '../hooks/useTournamentStats'
import { useEliminatedTeams } from '../hooks/useEliminatedTeams'
import { isPlayerEligible } from '../utils/tournamentEligibility'

// ─── Tournament-augmented player type ─────────────────────────────────────────

interface TournamentPlayer extends Player {
  tourneyPPG: number
  tourneyRPG: number
  tourneyAPG: number
  tourneySPG: number
  tourneyBPG: number
  tourneyFPts: number
  tourneyGames: number
  hasTourneyData: boolean
}

function buildTournamentPlayers(
  liveStats: Map<string, TournamentPlayerStats>,
  eliminatedTeamIds: Set<string>,
): TournamentPlayer[] {
  return mockPlayers
    .filter(p => isPlayerEligible(p, eliminatedTeamIds))
    .map(player => {
      // Match by ESPN ID
      const espnStats = liveStats.get(player.espnId?.toString() || '')

      if (!espnStats) {
        return {
          ...player,
          tourneyPPG: 0,
          tourneyRPG: 0,
          tourneyAPG: 0,
          tourneySPG: 0,
          tourneyBPG: 0,
          tourneyFPts: 0,
          tourneyGames: 0,
          hasTourneyData: false,
        }
      }

      return {
        ...player,
        tourneyPPG: espnStats.averages.ppg,
        tourneyRPG: espnStats.averages.rpg,
        tourneyAPG: espnStats.averages.apg,
        tourneySPG: espnStats.averages.spg,
        tourneyBPG: espnStats.averages.bpg,
        tourneyFPts: espnStats.fantasyPoints / espnStats.gamesPlayed,
        tourneyGames: espnStats.gamesPlayed,
        hasTourneyData: true,
      }
    })
}

// ─── Stat sections ────────────────────────────────────────────────────────────

interface StatSection {
  key: 'tourneyPPG' | 'tourneyRPG' | 'tourneyAPG' | 'tourneySPG' | 'tourneyBPG' | 'tourneyFPts'
  label: string
  unit: string
  icon: string
  color: string
}

const STAT_SECTIONS: StatSection[] = [
  { key: 'tourneyPPG',  label: 'Scoring Leaders',        unit: 'PPG',  icon: '🏀', color: '#FFD100' },
  { key: 'tourneyRPG',  label: 'Rebounding Leaders',     unit: 'RPG',  icon: '💪', color: '#FF6B00' },
  { key: 'tourneyAPG',  label: 'Assist Leaders',         unit: 'APG',  icon: '🎯', color: '#00C896' },
  { key: 'tourneySPG',  label: 'Steal Leaders',          unit: 'SPG',  icon: '🛡️', color: '#A855F7' },
  { key: 'tourneyBPG',  label: 'Block Leaders',          unit: 'BPG',  icon: '🚫', color: '#EF4444' },
  { key: 'tourneyFPts', label: 'Fantasy Points Leaders',  unit: 'FPts', icon: '⭐', color: '#FFD100' },
]

function getTourneyStat(player: TournamentPlayer, key: StatSection['key']): number {
  return player[key] ?? 0
}

const RANK_COLORS = ['#FFD100', '#9CA3AF', '#CD7F32', '#2C2C2C', '#2C2C2C']
const RANK_TEXT   = ['#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff']

function buildCustomStats(
  player: TournamentPlayer,
  key: StatSection['key'],
): [{ label: string; value: string }] {
  const fmt = (n: number) => n.toFixed(1)
  switch (key) {
    case 'tourneyPPG':  return [{ label: 'PPG',  value: fmt(player.tourneyPPG) }]
    case 'tourneyRPG':  return [{ label: 'RPG',  value: fmt(player.tourneyRPG) }]
    case 'tourneyAPG':  return [{ label: 'APG',  value: fmt(player.tourneyAPG) }]
    case 'tourneySPG':  return [{ label: 'SPG',  value: fmt(player.tourneySPG) }]
    case 'tourneyBPG':  return [{ label: 'BPG',  value: fmt(player.tourneyBPG) }]
    case 'tourneyFPts': return [{ label: 'FPts', value: fmt(player.tourneyFPts) }]
  }
}

export function PlayerSearchPage() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState<'tourneyFPts' | 'tourneyPPG' | 'tourneyRPG' | 'tourneyAPG'>('tourneyFPts')

  const { stats: liveStats, loading: statsLoading } = useTournamentStats()
  const eliminatedTeamIds = useEliminatedTeams()

  const tournamentPlayers = useMemo(
    () => buildTournamentPlayers(liveStats, eliminatedTeamIds),
    [liveStats, eliminatedTeamIds]
  )

  const getTopN = (key: StatSection['key'], n = 5): TournamentPlayer[] => {
    return [...tournamentPlayers]
      .filter(p => p.hasTourneyData)
      .sort((a, b) => getTourneyStat(b, key) - getTourneyStat(a, key))
      .slice(0, n)
  }

  const filtered = useMemo(() => {
    return tournamentPlayers
      .filter(p => posFilter === 'ALL' || p.positionGroup === posFilter)
      .filter(p => !search || p.fullName.toLowerCase().includes(search.toLowerCase()) || p.teamName.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (a.hasTourneyData !== b.hasTourneyData) return a.hasTourneyData ? -1 : 1
        return getTourneyStat(b, sortBy) - getTourneyStat(a, sortBy)
      })
  }, [search, posFilter, sortBy, tournamentPlayers])

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 rounded-full bg-[#FFD100]" />
          <span className="text-[10px] font-black text-[#FFD100] uppercase tracking-widest">2026 NCAA Tournament · Live Stats</span>
        </div>
        <h1 className="text-2xl font-black text-white">Top Performers</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {statsLoading
            ? 'Loading tournament stats from ESPN...'
            : `Live tournament stats from ${tournamentPlayers.filter(p => p.hasTourneyData).length} players across completed games · Updates every 2 min`
          }
        </p>
      </div>

      {statsLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-500 text-sm animate-pulse">Loading live tournament stats...</div>
        </div>
      ) : (
        <>
          {/* ── STAT LEADER SECTIONS ── */}
          {STAT_SECTIONS.map(section => {
            const leaders = getTopN(section.key)
            if (leaders.length === 0) return null
            const topVal = getTourneyStat(leaders[0], section.key)

            return (
              <section key={section.key}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border shrink-0"
                    style={{ background: `${section.color}11`, borderColor: `${section.color}33` }}
                  >
                    <span className="text-base leading-none">{section.icon}</span>
                    <span className="font-bold text-sm text-white">{section.label}</span>
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ background: `${section.color}22`, color: section.color }}
                    >
                      {section.unit}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-[#2C2C2C]" />
                  <span className="text-xs text-slate-500 shrink-0">
                    Leader:{' '}
                    <span className="font-bold" style={{ color: section.color }}>
                      {topVal.toFixed(1)} {section.unit}
                    </span>
                  </span>
                </div>

                <div className="flex gap-4 overflow-x-auto pt-3 pb-2 snap-x -mx-1 px-3">
                  {leaders.map((player, rank) => (
                    <div
                      key={player.id}
                      className="relative shrink-0 snap-start"
                      style={{ width: 204 }}
                    >
                      <div
                        className="absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shadow-md"
                        style={{ background: RANK_COLORS[rank], color: RANK_TEXT[rank] }}
                      >
                        {rank + 1}
                      </div>
                      <PlayerCard
                        player={player}
                        onClick={setSelectedPlayer}
                        customStats={buildCustomStats(player, section.key)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )
          })}

          {/* ── ALL PLAYERS ── */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[#2C2C2C]" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-2">All Players</span>
              <div className="flex-1 h-px bg-[#2C2C2C]" />
            </div>

            <div className="flex items-center gap-3 flex-wrap mb-4">
              <input
                type="text"
                placeholder="Search players or teams..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 min-w-48 bg-[#161616] border border-[#2C2C2C] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FFD10044]"
              />
              {(['ALL', 'G', 'F', 'C'] as const).map(pos => (
                <button
                  key={pos}
                  onClick={() => setPosFilter(pos)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    posFilter === pos
                      ? 'bg-[#FFD10022] text-[#FFD100] border border-[#FFD10044]'
                      : 'bg-[#161616] text-slate-400 border border-[#2C2C2C] hover:text-white'
                  }`}
                >
                  {pos === 'ALL' ? 'All' : pos}
                </button>
              ))}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="bg-[#161616] border border-[#2C2C2C] rounded-lg px-3 py-2 text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="tourneyFPts">Sort: Fantasy Pts</option>
                <option value="tourneyPPG">Sort: PPG</option>
                <option value="tourneyRPG">Sort: RPG</option>
                <option value="tourneyAPG">Sort: APG</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 mb-3">
              {filtered.length} players · <span className="text-green-500">{filtered.filter(p => p.hasTourneyData).length} with tournament stats</span>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 items-start">
              {filtered.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onClick={setSelectedPlayer}
                  customStats={player.hasTourneyData ? (
                    sortBy === 'tourneyFPts'
                      ? [{ label: 'FPts', value: player.tourneyFPts.toFixed(1) }]
                      : sortBy === 'tourneyPPG'
                      ? [{ label: 'T-PPG', value: player.tourneyPPG.toFixed(1) }]
                      : sortBy === 'tourneyRPG'
                      ? [{ label: 'T-RPG', value: player.tourneyRPG.toFixed(1) }]
                      : [{ label: 'T-APG', value: player.tourneyAPG.toFixed(1) }]
                  ) : undefined}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <PlayerModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  )
}
