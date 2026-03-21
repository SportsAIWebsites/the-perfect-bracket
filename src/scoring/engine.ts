import type { RuleSet, StatLine, ScoreBreakdown } from './types'
import { standardRules } from './rules/standardRules'

export class ScoringEngine {
  private ruleSet: RuleSet

  constructor(ruleSet: RuleSet = standardRules) {
    this.ruleSet = ruleSet
  }

  calculate(
    playerId: string,
    gameId: string,
    roundId: number,
    statLine: StatLine,
  ): ScoreBreakdown {
    const multiplier = this.ruleSet.roundMultipliers[roundId] ?? 1.0

    const breakdown = this.ruleSet.rules.map(rule => {
      const value = statLine[rule.stat as keyof StatLine] ?? 0
      return {
        stat: rule.stat,
        label: rule.label,
        value,
        points: value * rule.points,
      }
    })

    const basePoints = breakdown.reduce((sum, b) => sum + b.points, 0)
    const totalPoints = parseFloat((basePoints * multiplier).toFixed(2))

    return {
      playerId,
      gameId,
      roundId,
      statLine,
      basePoints: parseFloat(basePoints.toFixed(2)),
      multiplier,
      totalPoints,
      breakdown,
    }
  }

  /** Calculate from a raw PlayerGameLog-shaped object */
  calculateFromGameLog(
    playerId: string,
    gameId: string,
    roundId: number,
    log: {
      points: number
      rebounds: number
      assists: number
      steals: number
      blocks: number
      turnovers: number
      fouls: number
    },
  ): ScoreBreakdown {
    return this.calculate(playerId, gameId, roundId, {
      points: log.points,
      rebounds: log.rebounds,
      assists: log.assists,
      steals: log.steals,
      blocks: log.blocks,
      turnovers: log.turnovers,
      fouls: log.fouls,
    })
  }

  /** Project fantasy value from season averages */
  projectFromAverages(
    playerId: string,
    roundId: number,
    stats: { ppg: number; rpg: number; apg: number; spg: number; bpg: number; tpg?: number },
  ): ScoreBreakdown {
    return this.calculate(playerId, 'projected', roundId, {
      points: stats.ppg,
      rebounds: stats.rpg,
      assists: stats.apg,
      steals: stats.spg,
      blocks: stats.bpg,
      turnovers: stats.tpg ?? 2.0,
      fouls: 2.5, // average fouls per game
    })
  }
}

export const scoringEngine = new ScoringEngine(standardRules)
