import { useState, useEffect, useRef } from 'react'

export interface TournamentPlayerStats {
  espnId: string
  displayName: string
  teamAbbr: string
  gamesPlayed: number
  totals: {
    min: number
    pts: number
    reb: number
    ast: number
    stl: number
    blk: number
    to: number
    pf: number
    oreb: number
    dreb: number
    fgm: number
    fga: number
    tpm: number
    tpa: number
    ftm: number
    fta: number
  }
  averages: {
    ppg: number
    rpg: number
    apg: number
    spg: number
    bpg: number
    mpg: number
    topg: number
    fgPct: number
    tpPct: number
    ftPct: number
  }
  fantasyPoints: number // total fantasy points across all games
}

// ESPN stat labels order: MIN, PTS, FG, 3PT, FT, REB, AST, TO, STL, BLK, OREB, DREB, PF
function parseStats(stats: string[]): TournamentPlayerStats['totals'] & { min: number } {
  const parseSplit = (s: string) => {
    const parts = s.split('-')
    return { made: parseInt(parts[0]) || 0, att: parseInt(parts[1]) || 0 }
  }

  const min = parseInt(stats[0]) || 0
  const pts = parseInt(stats[1]) || 0
  const fg = parseSplit(stats[2] || '0-0')
  const tp = parseSplit(stats[3] || '0-0')
  const ft = parseSplit(stats[4] || '0-0')
  const reb = parseInt(stats[5]) || 0
  const ast = parseInt(stats[6]) || 0
  const to = parseInt(stats[7]) || 0
  const stl = parseInt(stats[8]) || 0
  const blk = parseInt(stats[9]) || 0
  const oreb = parseInt(stats[10]) || 0
  const dreb = parseInt(stats[11]) || 0
  const pf = parseInt(stats[12]) || 0

  return {
    min, pts, reb, ast, stl, blk, to, pf, oreb, dreb,
    fgm: fg.made, fga: fg.att,
    tpm: tp.made, tpa: tp.att,
    ftm: ft.made, fta: ft.att,
  }
}

function calcFantasyPoints(totals: TournamentPlayerStats['totals']): number {
  return (
    totals.pts * 1.0 +
    totals.reb * 1.0 +
    totals.ast * 1.5 +
    totals.stl * 2.0 +
    totals.blk * 2.0 +
    totals.to * -2.0 +
    totals.pf * -1.0
  )
}

// Cache completed game summaries so we don't re-fetch them
const gameCache = new Map<string, unknown>()

async function fetchGameSummary(eventId: string): Promise<unknown> {
  if (gameCache.has(eventId)) return gameCache.get(eventId)

  const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/summary?event=${eventId}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  gameCache.set(eventId, data)
  return data
}

async function fetchAllTournamentStats(): Promise<Map<string, TournamentPlayerStats>> {
  const playerMap = new Map<string, TournamentPlayerStats>()

  // 1. Get all tournament games from scoreboard
  const scoreboardUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=200&dates=20260318-20260407'
  const sbRes = await fetch(scoreboardUrl)
  if (!sbRes.ok) return playerMap
  const sbData = await sbRes.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events = sbData.events || [] as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalGameIds = events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((e: any) => e.status?.type?.name === 'STATUS_FINAL')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((e: any) => e.id as string)

  // 2. Fetch each completed game's summary (with caching)
  const summaries = await Promise.all(
    finalGameIds.map((id: string) => fetchGameSummary(id))
  )

  // 3. Parse player stats from each game
  for (const data of summaries) {
    if (!data) continue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const boxscore = (data as any).boxscore
    if (!boxscore?.players) continue

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const team of boxscore.players) {
      const teamAbbr = team.team?.abbreviation || ''

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const statGroup of (team.statistics || [])) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const athlete of (statGroup.athletes || [])) {
          const a = athlete.athlete
          const espnId = a.id?.toString() || ''
          const displayName = a.displayName || ''
          const rawStats = athlete.stats || []

          if (rawStats.length < 10) continue // skip DNPs with incomplete stats
          if (rawStats[0] === '0' || rawStats[0] === '--') continue // skip 0 min players

          const gameStats = parseStats(rawStats)

          if (playerMap.has(espnId)) {
            // Aggregate with existing
            const existing = playerMap.get(espnId)!
            existing.gamesPlayed += 1
            const t = existing.totals
            t.min += gameStats.min
            t.pts += gameStats.pts
            t.reb += gameStats.reb
            t.ast += gameStats.ast
            t.stl += gameStats.stl
            t.blk += gameStats.blk
            t.to += gameStats.to
            t.pf += gameStats.pf
            t.oreb += gameStats.oreb
            t.dreb += gameStats.dreb
            t.fgm += gameStats.fgm
            t.fga += gameStats.fga
            t.tpm += gameStats.tpm
            t.tpa += gameStats.tpa
            t.ftm += gameStats.ftm
            t.fta += gameStats.fta
          } else {
            playerMap.set(espnId, {
              espnId,
              displayName,
              teamAbbr,
              gamesPlayed: 1,
              totals: { ...gameStats },
              averages: { ppg: 0, rpg: 0, apg: 0, spg: 0, bpg: 0, mpg: 0, topg: 0, fgPct: 0, tpPct: 0, ftPct: 0 },
              fantasyPoints: 0,
            })
          }
        }
      }
    }
  }

  // 4. Compute averages and fantasy points
  for (const [, player] of playerMap) {
    const g = player.gamesPlayed
    const t = player.totals
    player.averages = {
      ppg: t.pts / g,
      rpg: t.reb / g,
      apg: t.ast / g,
      spg: t.stl / g,
      bpg: t.blk / g,
      mpg: t.min / g,
      topg: t.to / g,
      fgPct: t.fga > 0 ? t.fgm / t.fga : 0,
      tpPct: t.tpa > 0 ? t.tpm / t.tpa : 0,
      ftPct: t.fta > 0 ? t.ftm / t.fta : 0,
    }
    player.fantasyPoints = calcFantasyPoints(t)
  }

  return playerMap
}

export function useTournamentStats() {
  const [stats, setStats] = useState<Map<string, TournamentPlayerStats>>(new Map())
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const result = await fetchAllTournamentStats()
        if (!cancelled) {
          setStats(result)
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    // Poll every 2 minutes for newly completed games
    intervalRef.current = setInterval(load, 120_000)

    return () => {
      cancelled = true
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return { stats, loading }
}
