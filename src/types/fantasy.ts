export type PositionSlot = 'G1' | 'G2' | 'G3' | 'F1' | 'F2' | 'C' | 'FC1' | 'FC2' | 'G' | 'F' | 'FC' | 'FLEX'

export interface RosterPlayer {
  playerId: string
  positionSlot: PositionSlot
  draftedAt: string
}

export interface Roster {
  id: string
  userId: string
  roundId: number
  players: RosterPlayer[]
  lockedAt?: string
  createdAt: string
}

export interface RoundConfig {
  roundNumber: number
  label: string
  slots: PositionSlot[]
  slotCount: number
}

export const ROUND_CONFIGS: RoundConfig[] = [
  { roundNumber: 1, label: 'First Round',   slots: ['G1', 'G2', 'G3', 'FC1', 'FC2'], slotCount: 5 },
  { roundNumber: 2, label: 'Second Round',  slots: ['G1', 'G2', 'G3', 'FC1', 'FC2'], slotCount: 5 },
  { roundNumber: 3, label: 'Sweet 16',      slots: ['G', 'F', 'C', 'FLEX'],           slotCount: 4 },
  { roundNumber: 4, label: 'Elite Eight',   slots: ['G', 'FC', 'FLEX'],                slotCount: 3 },
  { roundNumber: 5, label: 'Final Four',    slots: ['G', 'FLEX'],                      slotCount: 2 },
]

export function canFillSlot(slot: PositionSlot, positionGroup: string): boolean {
  switch (slot) {
    case 'G1': case 'G2': case 'G3': case 'G': return positionGroup === 'G'
    case 'F1': case 'F2': case 'F': return positionGroup === 'F'
    case 'C': return positionGroup === 'C'
    case 'FC1': case 'FC2': case 'FC': return positionGroup === 'F' || positionGroup === 'C'
    case 'FLEX': return true
    default: return false
  }
}

import type { StatLine } from '../scoring/types'

export interface RoundPlayerScore {
  playerId: string
  playerName: string
  teamName: string
  teamAbbr: string
  position: string
  slot: PositionSlot  // references the type defined above
  fantasyPoints: number
  stats: StatLine | null
  isActual: boolean
}

export interface RoundScore {
  roundId: number
  roundLabel: string
  lockedAt: string       // ISO timestamp
  players: RoundPlayerScore[]
  totalPoints: number
}

export interface UserScore {
  userId: string
  displayName: string
  avatarUrl?: string
  roundScore: number
  cumulativeScore: number
  rank: number
  roundId: number
}
