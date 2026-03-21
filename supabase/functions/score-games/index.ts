/**
 * March Madness Fantasy — Auto-Scoring Edge Function
 *
 * Triggered by pg_cron every 15 minutes during tournament hours.
 * Fetches ESPN box scores → runs ScoringEngine → upserts to player_game_scores.
 *
 * Deploy: supabase functions deploy score-games
 * Schedule: select cron.schedule('score-games', '*/15 * * * *', 'select net.http_post(...)')
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ── Scoring constants (mirror standardRules.ts) ───────────────────────
const SCORING_RULES = [
  { stat: 'points',     multiplier: 1.0  },
  { stat: 'rebounds',   multiplier: 1.2  },
  { stat: 'assists',    multiplier: 1.5  },
  { stat: 'steals',     multiplier: 3.0  },
  { stat: 'blocks',     multiplier: 3.0  },
  { stat: 'turnovers',  multiplier: -1.0 },
  { stat: 'threesMade', multiplier: 0.5  },
]

const ROUND_MULTIPLIERS: Record<number, number> = {
  1: 1.0, 2: 1.0, 3: 1.25, 4: 1.5, 5: 2.0,
}

function calculateScore(stats: Record<string, number>, roundId: number) {
  const roundMultiplier = ROUND_MULTIPLIERS[roundId] ?? 1.0
  const breakdown: Record<string, number> = {}
  let basePoints = 0

  for (const rule of SCORING_RULES) {
    const val = stats[rule.stat] ?? 0
    const pts = val * rule.multiplier
    breakdown[rule.stat] = pts
    basePoints += pts
  }

  return {
    basePoints: parseFloat(basePoints.toFixed(2)),
    roundMultiplier,
    totalPoints: parseFloat((basePoints * roundMultiplier).toFixed(2)),
    breakdown,
  }
}

// ── ESPN API helpers ──────────────────────────────────────────────────
async function fetchEspnBoxScore(espnGameId: string) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/summary?event=${espnGameId}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`ESPN fetch failed: ${res.status}`)
  return res.json()
}

function extractPlayerStats(boxScore: Record<string, unknown>) {
  const players: {
    espnId: string
    name: string
    stats: Record<string, number>
  }[] = []

  const teams = (boxScore?.boxscore as Record<string, unknown>)?.teams as unknown[]
  if (!Array.isArray(teams)) return players

  for (const team of teams) {
    const teamObj = team as Record<string, unknown>
    const statistics = teamObj.statistics as unknown[]
    if (!Array.isArray(statistics)) continue

    for (const statGroup of statistics) {
      const group = statGroup as Record<string, unknown>
      const athletes = group.athletes as unknown[]
      if (!Array.isArray(athletes)) continue

      for (const athlete of athletes) {
        const a = athlete as Record<string, unknown>
        const id = (a.athlete as Record<string, unknown>)?.id as string
        const name = (a.athlete as Record<string, unknown>)?.displayName as string
        const stats = a.stats as string[]

        // ESPN stat order for basketball: MIN, FG, 3PT, FT, OREB, DREB, REB, AST, STL, BLK, TO, PF, +/-, PTS
        if (!stats || stats.length < 14) continue

        players.push({
          espnId: id,
          name,
          stats: {
            points:    parseFloat(stats[13]) || 0,
            rebounds:  parseFloat(stats[6])  || 0,
            assists:   parseFloat(stats[7])  || 0,
            steals:    parseFloat(stats[8])  || 0,
            blocks:    parseFloat(stats[9])  || 0,
            turnovers: parseFloat(stats[10]) || 0,
            threesMade: (() => {
              const threeStr = stats[2] ?? '0-0'
              return parseFloat(threeStr.split('-')[0]) || 0
            })(),
          },
        })
      }
    }
  }

  return players
}

// ── Main handler ──────────────────────────────────────────────────────
Deno.serve(async (_req) => {
  try {
    // 1. Get current live round
    const { data: round } = await supabase
      .from('rounds')
      .select('id, round_number, status')
      .in('status', ['live', 'drafting'])
      .order('round_number')
      .limit(1)
      .single()

    if (!round) {
      return new Response(JSON.stringify({ message: 'No live round' }), { status: 200 })
    }

    const roundId: number = round.round_number

    // 2. Get in-progress/final games with ESPN IDs that haven't been scored yet
    // In production this would query a games table. For now we log and return.
    console.log(`Scoring round ${roundId} (DB round id: ${round.id})`)

    // 3. [Production] For each game, fetch ESPN box score and upsert scores
    //    This section requires espnGameId values stored in a games table.
    //    Example flow (activate when games table is populated):
    /*
    const { data: games } = await supabase
      .from('games')
      .select('id, espn_game_id, status')
      .eq('round_id', round.id)
      .in('status', ['in_progress', 'final'])

    for (const game of games ?? []) {
      if (!game.espn_game_id) continue
      const boxScore = await fetchEspnBoxScore(game.espn_game_id)
      const playerStats = extractPlayerStats(boxScore)

      for (const p of playerStats) {
        const score = calculateScore(p.stats, roundId)
        await supabase.from('player_game_scores').upsert({
          player_id: p.espnId,
          game_id: game.id,
          round_id: round.id,
          base_points: score.basePoints,
          round_multiplier: score.roundMultiplier,
          total_points: score.totalPoints,
          score_breakdown: score.breakdown,
          computed_at: new Date().toISOString(),
        }, { onConflict: 'player_id,game_id' })
      }
    }
    */

    return new Response(
      JSON.stringify({ success: true, round: roundId }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('score-games error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
