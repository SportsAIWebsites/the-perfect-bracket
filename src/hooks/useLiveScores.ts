import { useState, useEffect } from 'react'

interface LiveGame {
  espnId: string
  homeTeam: string
  homeAbbr: string
  homeScore: number
  awayTeam: string
  awayAbbr: string
  awayScore: number
  status: 'scheduled' | 'in_progress' | 'final'
  clock: string
  period: number
  headline: string
}

interface UseLiveScoresReturn {
  games: LiveGame[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

const ESPN_SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=50'

const POLL_INTERVAL_MS = 30_000

function mapStatus(
  state: string,
  completed: boolean
): 'scheduled' | 'in_progress' | 'final' {
  if (state === 'post' || completed) return 'final'
  if (state === 'in') return 'in_progress'
  return 'scheduled'
}

function parseGames(data: unknown): LiveGame[] {
  const events = (data as { events?: unknown[] }).events
  if (!Array.isArray(events)) return []

  const games: LiveGame[] = []

  for (const event of events) {
    try {
      const e = event as {
        id: string
        name: string
        status: {
          type: { state: string; completed: boolean }
          displayClock: string
          period: number
        }
        competitions: Array<{
          competitors: Array<{
            homeAway: string
            team: { abbreviation: string; displayName: string }
            score: string
          }>
          groups?: { shortName?: string }
          notes?: Array<{ headline?: string }>
        }>
      }

      const competition = e.competitions[0]
      if (!competition) continue

      const competitors = competition.competitors ?? []
      const home = competitors.find((c) => c.homeAway === 'home')
      const away = competitors.find((c) => c.homeAway === 'away')
      if (!home || !away) continue

      const state = e.status?.type?.state ?? 'pre'
      const completed = e.status?.type?.completed ?? false
      const status = mapStatus(state, completed)

      const noteHeadline = competition.notes?.[0]?.headline ?? ''
      const groupName = competition.groups?.shortName ?? ''
      const headline = noteHeadline || groupName

      games.push({
        espnId: e.id,
        homeTeam: home.team.displayName,
        homeAbbr: home.team.abbreviation,
        homeScore: parseFloat(home.score) || 0,
        awayTeam: away.team.displayName,
        awayAbbr: away.team.abbreviation,
        awayScore: parseFloat(away.score) || 0,
        status,
        clock: e.status?.displayClock ?? '',
        period: e.status?.period ?? 0,
        headline,
      })
    } catch {
      // Skip malformed events
    }
  }

  return games
}

export function useLiveScores(): UseLiveScoresReturn {
  const [games, setGames] = useState<LiveGame[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchScores() {
      try {
        const response = await fetch(ESPN_SCOREBOARD_URL)
        if (!response.ok) {
          throw new Error(`ESPN API returned ${response.status}`)
        }
        const data = await response.json()
        if (!cancelled) {
          setGames(parseGames(data))
          setLastUpdated(new Date())
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch scores')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchScores()

    const intervalId = setInterval(fetchScores, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [])

  return { games, loading, error, lastUpdated }
}
