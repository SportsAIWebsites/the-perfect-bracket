export interface ScoringRule {
  stat: string
  points: number
  label: string
}

export interface RuleSet {
  rules: ScoringRule[]
  roundMultipliers: Record<number, number>
}

export interface StatLine {
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  fouls: number
  threesMade?: number
}

export interface ScoreBreakdown {
  playerId: string
  gameId: string
  roundId: number
  statLine: StatLine
  basePoints: number
  multiplier: number
  totalPoints: number
  breakdown: { stat: string; value: number; points: number; label: string }[]
}
