export type Region = 'East' | 'West' | 'South' | 'Midwest'

export interface Team {
  id: string
  espnId: string
  name: string
  shortName: string
  abbreviation: string
  seed: number
  region: Region
  record: { wins: number; losses: number }
  ranking?: number
  colors: { primary: string; secondary: string }
  logoUrl: string
  conference: string
  stats: TeamStats
}

export interface TeamStats {
  ppg: number
  oppPpg: number
  pace: number
  efgPct: number
  tovPct: number
  rebPct: number
}
