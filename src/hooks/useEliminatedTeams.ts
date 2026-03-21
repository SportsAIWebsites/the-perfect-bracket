import { useState, useEffect } from 'react'
import { mockGames } from '../mock'

const ESPN_SCOREBOARD =
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=64'

// Build a lookup: OUR team abbreviation (uppercase) → our teamId
const ABBR_TO_TEAM_ID: Record<string, string> = {}
mockGames.forEach(g => {
  ABBR_TO_TEAM_ID[g.homeTeamAbbr.toUpperCase()] = g.homeTeamId
  ABBR_TO_TEAM_ID[g.awayTeamAbbr.toUpperCase()] = g.awayTeamId
})

// ESPN uses different abbreviations for some teams — map to ours
const ESPN_TO_OURS: Record<string, string> = {
  KAN: 'KU', UK: 'KY', CONN: 'UCONN', UF: 'FLA',
  ISU: 'IAST', UMICH: 'MICH', OU: 'OKLA', STAN: 'STAN',
}

function canonicalAbbr(abbr: string): string {
  const up = abbr.toUpperCase()
  return ESPN_TO_OURS[up] ?? up
}

/** Compute eliminated teams from static mockGames (used as starting state + fallback) */
function staticEliminated(): Set<string> {
  const out = new Set<string>()
  mockGames
    .filter(g => g.status === 'final' && g.winnerId)
    .forEach(g => {
      const loserId =
        g.homeTeamId === g.winnerId ? g.awayTeamId : g.homeTeamId
      out.add(loserId)
    })
  return out
}

/**
 * Polls the ESPN scoreboard every 60 s and returns the set of eliminated teamIds.
 * Starts from the static mockGames data and merges in live ESPN results.
 */
export function useEliminatedTeams(): Set<string> {
  const [eliminated, setEliminated] = useState<Set<string>>(staticEliminated)

  useEffect(() => {
    async function fetchAndMerge() {
      try {
        const res = await fetch(ESPN_SCOREBOARD)
        if (!res.ok) return
        const data = await res.json()
        const events = (data as { events?: unknown[] }).events ?? []

        const merged = new Set(staticEliminated())

        for (const event of events) {
          try {
            const e = event as {
              status: { type: { state: string; completed: boolean } }
              competitions: Array<{
                competitors: Array<{
                  homeAway: string
                  score: string
                  team: { abbreviation: string }
                }>
              }>
            }
            const state = e.status?.type?.state
            const completed = e.status?.type?.completed
            if (state !== 'post' && !completed) continue

            const comp = e.competitions?.[0]
            if (!comp) continue
            const home = comp.competitors.find(c => c.homeAway === 'home')
            const away = comp.competitors.find(c => c.homeAway === 'away')
            if (!home || !away) continue

            const homeScore = parseFloat(home.score ?? '0')
            const awayScore = parseFloat(away.score ?? '0')
            if (homeScore === awayScore) continue

            const loserAbbr = canonicalAbbr(
              homeScore > awayScore
                ? away.team.abbreviation
                : home.team.abbreviation
            )
            const teamId = ABBR_TO_TEAM_ID[loserAbbr]
            if (teamId) merged.add(teamId)
          } catch { /* skip malformed event */ }
        }

        setEliminated(merged)
      } catch { /* keep previous state on network error */ }
    }

    fetchAndMerge()
    const interval = setInterval(fetchAndMerge, 60_000)
    return () => clearInterval(interval)
  }, [])

  return eliminated
}
