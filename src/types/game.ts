export type GameStatus = 'scheduled' | 'in_progress' | 'final'
export type BracketRound = 1 | 2 | 3 | 4 | 5 | 6

export interface PlayerGameLog {
  playerId: string
  gameId: string
  teamId: string
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  fouls: number
  minutesPlayed: number
}

export interface Game {
  id: string
  round: BracketRound
  region: string
  scheduledAt: string
  status: GameStatus
  homeTeamId: string
  awayTeamId: string
  homeTeamName: string
  awayTeamName: string
  homeTeamAbbr: string
  awayTeamAbbr: string
  homeSeed: number
  awaySeed: number
  homeScore: number
  awayScore: number
  winnerId?: string
  topPerformerIds: string[]
  broadcastNetwork: string
  venue: string
  espnGameId?: string
}
