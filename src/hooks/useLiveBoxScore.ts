import { useState, useEffect } from 'react'

interface PlayerBoxStats {
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  fouls: number
  minutesPlayed: number
}

interface UseLiveBoxScoreReturn {
  playerStats: Map<string, PlayerBoxStats>
  loading: boolean
}

const ESPN_SUMMARY_BASE =
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/summary?event='

const STAT_FIELD_MAP: Record<keyof PlayerBoxStats, string[]> = {
  points: ['PTS'],
  rebounds: ['REB'],
  assists: ['AST'],
  steals: ['STL'],
  blocks: ['BLK'],
  turnovers: ['TO'],
  fouls: ['PF'],
  minutesPlayed: ['MIN'],
}

function findStatIndex(labels: string[], candidates: string[]): number {
  for (const candidate of candidates) {
    const idx = labels.indexOf(candidate)
    if (idx !== -1) return idx
  }
  return -1
}

function parseBoxScore(data: unknown): Map<string, PlayerBoxStats> {
  const result = new Map<string, PlayerBoxStats>()

  const boxscore = (data as { boxscore?: { players?: unknown[] } }).boxscore
  if (!boxscore || !Array.isArray(boxscore.players)) return result

  for (const teamEntry of boxscore.players) {
    try {
      const team = teamEntry as {
        statistics?: Array<{
          athletes?: Array<{
            athlete: { id: string; displayName: string }
            stats: string[]
          }>
          labels?: string[]
        }>
      }

      const statistics = team.statistics?.[0]
      if (!statistics) continue

      const labels: string[] = statistics.labels ?? []
      const athletes = statistics.athletes ?? []

      // Pre-compute label indices for each stat field
      const indices: Record<keyof PlayerBoxStats, number> = {
        points: findStatIndex(labels, STAT_FIELD_MAP.points),
        rebounds: findStatIndex(labels, STAT_FIELD_MAP.rebounds),
        assists: findStatIndex(labels, STAT_FIELD_MAP.assists),
        steals: findStatIndex(labels, STAT_FIELD_MAP.steals),
        blocks: findStatIndex(labels, STAT_FIELD_MAP.blocks),
        turnovers: findStatIndex(labels, STAT_FIELD_MAP.turnovers),
        fouls: findStatIndex(labels, STAT_FIELD_MAP.fouls),
        minutesPlayed: findStatIndex(labels, STAT_FIELD_MAP.minutesPlayed),
      }

      for (const athleteEntry of athletes) {
        try {
          const { athlete, stats } = athleteEntry
          if (!athlete?.id || !Array.isArray(stats)) continue

          function getStat(field: keyof PlayerBoxStats): number {
            const idx = indices[field]
            if (idx === -1 || idx >= stats.length) return 0
            const raw = stats[idx]
            // minutesPlayed may be "32:15" — convert to decimal minutes
            if (field === 'minutesPlayed' && raw.includes(':')) {
              const [min, sec] = raw.split(':').map(Number)
              return min + sec / 60
            }
            return parseFloat(raw) || 0
          }

          result.set(athlete.id, {
            points: getStat('points'),
            rebounds: getStat('rebounds'),
            assists: getStat('assists'),
            steals: getStat('steals'),
            blocks: getStat('blocks'),
            turnovers: getStat('turnovers'),
            fouls: getStat('fouls'),
            minutesPlayed: getStat('minutesPlayed'),
          })
        } catch {
          // Skip malformed athlete entries
        }
      }
    } catch {
      // Skip malformed team entries
    }
  }

  return result
}

export function useLiveBoxScore(espnGameId: string | null): UseLiveBoxScoreReturn {
  const [playerStats, setPlayerStats] = useState<Map<string, PlayerBoxStats>>(
    new Map()
  )
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!espnGameId) {
      setPlayerStats(new Map())
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    async function fetchBoxScore() {
      try {
        const response = await fetch(`${ESPN_SUMMARY_BASE}${espnGameId}`)
        if (!response.ok) {
          throw new Error(`ESPN API returned ${response.status}`)
        }
        const data = await response.json()
        if (!cancelled) {
          setPlayerStats(parseBoxScore(data))
        }
      } catch {
        if (!cancelled) {
          setPlayerStats(new Map())
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchBoxScore()

    return () => {
      cancelled = true
    }
  }, [espnGameId])

  return { playerStats, loading }
}
