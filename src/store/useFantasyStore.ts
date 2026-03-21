import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Player } from '../types/player'
import type { PositionSlot } from '../types/fantasy'
import { canFillSlot, ROUND_CONFIGS } from '../types/fantasy'
import type { RoundScore, RoundPlayerScore } from '../types/fantasy'
import type { PlayerLiveScore } from '../hooks/useLiveFantasyScoring'

export interface DraftedPlayer {
  player: Player
  slot: PositionSlot
}

interface FantasyStore {
  currentRound: number
  draftedPlayers: DraftedPlayer[]
  totalScore: number
  roundHistory: RoundScore[]
  rosterLocked: boolean

  draft: (player: Player) => boolean
  drop: (playerId: string) => void
  setTotalScore: (score: number) => void
  lockRoster: () => void

  /**
   * Snapshot current round's scores into history and advance to the next round.
   * `liveScores` comes from useLiveFantasyScoring.
   */
  lockRound: (liveScores: Map<string, PlayerLiveScore>) => void

  /** Clear round history (reset season) */
  resetSeason: () => void

  // derived helpers
  getSlots: () => { slot: PositionSlot; drafted: DraftedPlayer | null }[]
  isDrafted: (playerId: string) => boolean
  canDraft: (player: Player) => boolean
  cumulativePoints: () => number
}

export const useFantasyStore = create<FantasyStore>()(
  persist(
    (set, get) => ({
      currentRound: 2,
      draftedPlayers: [],
      totalScore: 0,
      roundHistory: [
        {
          roundId: 1,
          roundLabel: 'First Round',
          lockedAt: '2026-03-20T23:59:00.000Z',
          players: [],
          totalPoints: 0,
        },
      ],
      rosterLocked: false,

      draft(player) {
        const { draftedPlayers, currentRound } = get()
        const config = ROUND_CONFIGS.find(r => r.roundNumber === currentRound)
        if (!config) return false
        const occupiedSlots = new Set(draftedPlayers.map(d => d.slot))
        const slot = config.slots.find(
          s => !occupiedSlots.has(s) && canFillSlot(s, player.positionGroup)
        )
        if (!slot) return false
        set(state => ({ draftedPlayers: [...state.draftedPlayers, { player, slot }] }))
        return true
      },

      drop(playerId) {
        set(state => ({
          draftedPlayers: state.draftedPlayers.filter(d => d.player.id !== playerId),
        }))
      },

      setTotalScore(score) {
        set({ totalScore: score })
      },

      lockRoster() {
        set({ rosterLocked: true })
      },

      lockRound(liveScores) {
        const { currentRound, draftedPlayers, roundHistory } = get()
        const config = ROUND_CONFIGS.find(r => r.roundNumber === currentRound)
        if (!config) return

        // Build player score records
        const players: RoundPlayerScore[] = draftedPlayers.map(({ player, slot }) => {
          const live = liveScores.get(player.id)
          return {
            playerId: player.id,
            playerName: player.fullName,
            teamName: player.teamName,
            teamAbbr: player.teamAbbr,
            position: player.position,
            slot,
            fantasyPoints: live?.fantasyPoints ?? 0,
            stats: live?.stats ?? null,
            isActual: live?.isActual ?? false,
          }
        })

        const totalPoints = players.reduce((sum, p) => sum + p.fantasyPoints, 0)

        const roundScore: RoundScore = {
          roundId: currentRound,
          roundLabel: config.label,
          lockedAt: new Date().toISOString(),
          players,
          totalPoints,
        }

        // Check we haven't already locked this round
        const alreadyLocked = roundHistory.some(r => r.roundId === currentRound)
        const nextRound = currentRound + 1
        const hasNextRound = ROUND_CONFIGS.some(r => r.roundNumber === nextRound)

        set({
          roundHistory: alreadyLocked
            ? roundHistory.map(r => r.roundId === currentRound ? roundScore : r)
            : [...roundHistory, roundScore],
          // Advance to next round and clear roster for re-drafting
          currentRound: hasNextRound ? nextRound : currentRound,
          draftedPlayers: hasNextRound ? [] : draftedPlayers,
          rosterLocked: false,
        })
      },

      resetSeason() {
        set({
          currentRound: 2,
          draftedPlayers: [],
          roundHistory: [
            { roundId: 1, roundLabel: 'First Round', lockedAt: '2026-03-20T23:59:00.000Z', players: [], totalPoints: 0 },
          ],
          totalScore: 0,
          rosterLocked: false,
        })
      },

      getSlots() {
        const { draftedPlayers, currentRound } = get()
        const config = ROUND_CONFIGS.find(r => r.roundNumber === currentRound)
        if (!config) return []
        return config.slots.map(slot => ({
          slot,
          drafted: draftedPlayers.find(d => d.slot === slot) ?? null,
        }))
      },

      isDrafted(playerId) {
        return get().draftedPlayers.some(d => d.player.id === playerId)
      },

      canDraft(player) {
        const { draftedPlayers, currentRound } = get()
        if (get().isDrafted(player.id)) return false
        const config = ROUND_CONFIGS.find(r => r.roundNumber === currentRound)
        if (!config) return false
        const occupiedSlots = new Set(draftedPlayers.map(d => d.slot))
        return config.slots.some(
          s => !occupiedSlots.has(s) && canFillSlot(s, player.positionGroup)
        )
      },

      cumulativePoints() {
        return get().roundHistory.reduce((sum, r) => sum + r.totalPoints, 0)
      },
    }),
    {
      name: 'snapback-fantasy-store',
      version: 2,
      // Only persist the data we need — not derived functions
      partialize: (state) => ({
        currentRound: state.currentRound,
        draftedPlayers: state.draftedPlayers,
        totalScore: state.totalScore,
        roundHistory: state.roundHistory,
        rosterLocked: state.rosterLocked,
      }),
    }
  )
)
