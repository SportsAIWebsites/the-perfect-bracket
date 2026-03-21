export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C'
export type PositionGroup = 'G' | 'F' | 'C'
export type PlayerYear = 'Fr' | 'So' | 'Jr' | 'Sr' | 'Grad'

export interface Player {
  id: string
  espnId: string
  firstName: string
  lastName: string
  fullName: string
  teamId: string
  teamName: string
  teamAbbr: string
  jerseyNumber: string
  position: Position
  positionGroup: PositionGroup
  year: PlayerYear
  heightIn: number
  weightLbs: number
  hometown: string
  photoUrl: string
  stats: PlayerSeasonStats
  tournamentStats?: PlayerTournamentStats
  fantasyValue: number  // 1-100
  isInjured: boolean
  injuryNote?: string
  highlightIds: string[]
  seed: number
  region: string
}

export interface PlayerSeasonStats {
  gamesPlayed: number
  ppg: number
  rpg: number
  apg: number
  spg: number
  bpg: number
  fgPct: number
  threePct: number
  ftPct: number
  mpg: number
  tpg: number
  plusMinus: number
  threesMadePg: number
}

export interface PlayerTournamentStats {
  gamesPlayed: number
  ppg: number
  rpg: number
  apg: number
  spg: number
  bpg: number
  fgPct: number
  threePct: number
  ftPct: number
  tpg: number
  threesMadePg: number
}

export interface PlayerGameLog {
  gameId: string
  date: string
  opponent: string
  result: 'W' | 'L'
  score: string
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  minutes: number
  fgm: number
  fga: number
  threesMade: number
  fantasyPoints?: number
}
