import { useState, useEffect, useRef } from 'react'
import type { DraftedPlayer } from '../store/useFantasyStore'
import { scoringEngine } from '../scoring/engine'
import type { StatLine } from '../scoring/types'
import { getPlayerLogs } from '../mock/playerGameLogs'
import { mockGames } from '../mock'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlayerLiveScore {
  playerId: string
  fantasyPoints: number
  stats: StatLine | null
  isLive: boolean       // game currently in progress
  isActual: boolean     // using real stats (not projection)
  gameStatus: 'live' | 'final' | 'upcoming' | 'no_game'
}

export interface UseLiveFantasyScoringReturn {
  scores: Map<string, PlayerLiveScore>
  totalPoints: number
  loading: boolean
  lastUpdated: Date | null
}

// ─── ESPN API endpoints ───────────────────────────────────────────────────────

const ESPN_SCOREBOARD =
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=50'
const ESPN_SUMMARY = (id: string) =>
  `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/summary?event=${id}`

const POLL_MS = 30_000

// ─── Name normalization (for fallback matching) ───────────────────────────────

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+(jr\.?|sr\.?|ii|iii|iv|v)\s*$/i, '')
    .replace(/[''`]/g, '')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── ESPN abbreviation aliases ────────────────────────────────────────────────
// Some teams have different abbreviations between ESPN and our data.
// Keys are what ESPN returns; values are what we store in teamAbbr.

const ESPN_ABBR_TO_OURS: Record<string, string> = {
  'KAN':  'KU',
  'UK':   'KY',
  'CONN': 'UCONN',
  'UF':   'FLA',
  'ISU':  'IAST',
  'UMICH':'MICH',
  'NW':   'NW',
  'VT':   'VT',
  'OU':   'OKLA',
  'OSU':  'OSU',
  'STAN': 'STAN',
  'UCLA': 'UCLA',
  'USC':  'USC',
  'ND':   'ND',
}

function canonicalAbbr(abbr: string): string {
  return ESPN_ABBR_TO_OURS[abbr.toUpperCase()] ?? abbr.toUpperCase()
}

// ─── ESPN game parsing ────────────────────────────────────────────────────────

interface EspnGame {
  espnId: string
  homeAbbr: string
  awayAbbr: string
  status: 'scheduled' | 'in_progress' | 'final'
}

function parseScoreboard(data: unknown): EspnGame[] {
  const events = (data as { events?: unknown[] }).events
  if (!Array.isArray(events)) return []

  return events.flatMap(event => {
    try {
      const e = event as {
        id: string
        status: { type: { state: string; completed: boolean } }
        competitions: Array<{
          competitors: Array<{ homeAway: string; team: { abbreviation: string } }>
        }>
      }
      const comp = e.competitions[0]
      if (!comp) return []
      const home = comp.competitors.find(c => c.homeAway === 'home')
      const away = comp.competitors.find(c => c.homeAway === 'away')
      if (!home || !away) return []

      const state = e.status?.type?.state ?? 'pre'
      const completed = e.status?.type?.completed ?? false
      const status: EspnGame['status'] =
        state === 'post' || completed ? 'final' :
        state === 'in' ? 'in_progress' :
        'scheduled'

      return [{
        espnId: e.id,
        homeAbbr: canonicalAbbr(home.team.abbreviation),
        awayAbbr: canonicalAbbr(away.team.abbreviation),
        status,
      }]
    } catch { return [] }
  })
}

// ─── Box score parsing ────────────────────────────────────────────────────────

interface BoxEntry {
  espnId: string
  displayName: string
  normalizedName: string
  stats: StatLine
}

function parseBoxScore(data: unknown): { byEspnId: Map<string, BoxEntry>; byName: Map<string, BoxEntry> } {
  const byEspnId = new Map<string, BoxEntry>()
  const byName = new Map<string, BoxEntry>()

  const players = (data as { boxscore?: { players?: unknown[] } }).boxscore?.players
  if (!Array.isArray(players)) return { byEspnId, byName }

  for (const teamEntry of players) {
    try {
      const statistics = (teamEntry as { statistics?: unknown[] }).statistics
      if (!Array.isArray(statistics) || !statistics[0]) continue
      const stat0 = statistics[0] as {
        labels?: string[]
        athletes?: Array<{ athlete: { id: string; displayName: string }; stats: string[]; didNotPlay?: boolean }>
      }

      const labels = stat0.labels ?? []
      const idx = (candidates: string[]) => {
        for (const c of candidates) { const i = labels.indexOf(c); if (i !== -1) return i }
        return -1
      }
      const PTS = idx(['PTS'])
      const REB = idx(['REB'])
      const AST = idx(['AST'])
      const STL = idx(['STL'])
      const BLK = idx(['BLK'])
      const TO  = idx(['TO'])
      const PF  = idx(['PF'])

      const get = (s: string[], i: number) => i === -1 ? 0 : (parseFloat(s[i]) || 0)

      for (const a of (stat0.athletes ?? [])) {
        try {
          if (!a.athlete?.id || !Array.isArray(a.stats)) continue
          if (a.didNotPlay) continue
          const s = a.stats
          const stats: StatLine = {
            points:    get(s, PTS),
            rebounds:  get(s, REB),
            assists:   get(s, AST),
            steals:    get(s, STL),
            blocks:    get(s, BLK),
            turnovers: get(s, TO),
            fouls:     get(s, PF),
          }
          const entry: BoxEntry = {
            espnId: a.athlete.id,
            displayName: a.athlete.displayName,
            normalizedName: normalizeName(a.athlete.displayName),
            stats,
          }
          byEspnId.set(a.athlete.id, entry)
          byName.set(entry.normalizedName, entry)
        } catch { /* skip */ }
      }
    } catch { /* skip */ }
  }

  return { byEspnId, byName }
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useLiveFantasyScoring(
  draftedPlayers: DraftedPlayer[],
  currentRound: number,
): UseLiveFantasyScoringReturn {
  const [scores, setScores] = useState<Map<string, PlayerLiveScore>>(new Map())
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const cancelRef = useRef(false)

  useEffect(() => {
    cancelRef.current = false

    async function compute() {
      try {
        // 1. Fetch scoreboard
        const sbRes = await fetch(ESPN_SCOREBOARD)
        if (!sbRes.ok || cancelRef.current) return
        const sbData = await sbRes.json()
        const espnGames = parseScoreboard(sbData)

        // 2. For each player, find their ESPN game
        //    Match by teamAbbr (canonicalized)
        const playerGameMap = new Map<string, EspnGame>() // playerId → game
        for (const { player } of draftedPlayers) {
          const myAbbr = player.teamAbbr.toUpperCase()
          const game = espnGames.find(
            g => g.homeAbbr === myAbbr || g.awayAbbr === myAbbr
          )
          if (game) playerGameMap.set(player.id, game)
        }

        // 3. Fetch box scores for all unique relevant live/final games
        const uniqueGameIds = new Set<string>()
        for (const game of playerGameMap.values()) {
          if (game.status === 'in_progress' || game.status === 'final') {
            uniqueGameIds.add(game.espnId)
          }
        }

        const boxScores = new Map<string, ReturnType<typeof parseBoxScore>>()
        await Promise.all(
          Array.from(uniqueGameIds).map(async gameId => {
            try {
              const res = await fetch(ESPN_SUMMARY(gameId))
              if (res.ok && !cancelRef.current) {
                boxScores.set(gameId, parseBoxScore(await res.json()))
              }
            } catch { /* network failure → skip */ }
          })
        )

        if (cancelRef.current) return

        // 4. Score each player
        // Only use mock logs from games belonging to the current round
        const currentRoundGameIds = new Set(
          mockGames.filter(g => g.round === currentRound).map(g => g.id)
        )

        const result = new Map<string, PlayerLiveScore>()

        for (const { player } of draftedPlayers) {
          const game = playerGameMap.get(player.id)
          const gameStatus: PlayerLiveScore['gameStatus'] =
            !game              ? 'no_game'  :
            game.status === 'in_progress' ? 'live'   :
            game.status === 'final'       ? 'final'  :
            'upcoming'

          // Try live/final ESPN box score first
          if (game && (game.status === 'in_progress' || game.status === 'final')) {
            const box = boxScores.get(game.espnId)
            if (box) {
              // Try by ESPN ID first
              let entry = player.espnId && player.espnId !== '0'
                ? box.byEspnId.get(player.espnId)
                : undefined

              // Fall back to name match
              if (!entry) {
                const norm = normalizeName(player.fullName)
                entry = box.byName.get(norm)
                // Also try matching by last name only as last resort
                if (!entry) {
                  const lastName = norm.split(' ').slice(-1)[0]
                  for (const [key, val] of box.byName) {
                    if (key.endsWith(lastName) && key.startsWith(norm.split(' ')[0][0])) {
                      entry = val
                      break
                    }
                  }
                }
              }

              if (entry) {
                const scored = scoringEngine.calculateFromGameLog(
                  player.id, game.espnId, currentRound, entry.stats
                )
                result.set(player.id, {
                  playerId: player.id,
                  fantasyPoints: scored.totalPoints,
                  stats: entry.stats,
                  isLive: game.status === 'in_progress',
                  isActual: true,
                  gameStatus,
                })
                continue
              }
            }
          }

          // Fall back to mock game log — only for games in the current round
          const mockLogs = getPlayerLogs(player.id).filter(l => currentRoundGameIds.has(l.gameId))
          if (mockLogs.length > 0) {
            const log = mockLogs[0]
            const scored = scoringEngine.calculateFromGameLog(
              player.id, log.gameId, currentRound, log
            )
            result.set(player.id, {
              playerId: player.id,
              fantasyPoints: scored.totalPoints,
              stats: log,
              isLive: false,
              isActual: true,
              gameStatus: game?.status === 'final' ? 'final' : gameStatus,
            })
            continue
          }

          // Last resort: project from season averages
          const projected = scoringEngine.projectFromAverages(player.id, currentRound, player.stats)
          result.set(player.id, {
            playerId: player.id,
            fantasyPoints: projected.totalPoints,
            stats: null,
            isLive: false,
            isActual: false,
            gameStatus,
          })
        }

        setScores(result)
        setLastUpdated(new Date())
      } catch { /* network error — keep previous state */ }
      finally {
        if (!cancelRef.current) setLoading(false)
      }
    }

    compute()
    const interval = setInterval(compute, POLL_MS)
    return () => {
      cancelRef.current = true
      clearInterval(interval)
    }
  }, [draftedPlayers, currentRound])

  const totalPoints = Array.from(scores.values()).reduce((sum, s) => sum + s.fantasyPoints, 0)

  return { scores, totalPoints, loading, lastUpdated }
}
