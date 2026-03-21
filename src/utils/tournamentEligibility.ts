import { mockGames } from '../mock'

/**
 * Returns the set of teamIds that have been knocked out of the tournament.
 * A team is eliminated once their game result is final and they are the loser.
 * This is recomputed from mockGames every call (fast enough — small array).
 */
export function getEliminatedTeamIds(): Set<string> {
  const eliminated = new Set<string>()
  mockGames
    .filter(g => g.status === 'final' && g.winnerId)
    .forEach(g => {
      const loserId =
        g.homeTeamId === g.winnerId ? g.awayTeamId : g.homeTeamId
      eliminated.add(loserId)
    })
  return eliminated
}

/**
 * Returns true if a player is eligible to be drafted:
 *   - Their team has not been eliminated
 *   - They are not marked as injured
 */
export function isPlayerEligible(
  player: { teamId: string; isInjured: boolean },
  eliminatedTeamIds: Set<string>,
): boolean {
  return !eliminatedTeamIds.has(player.teamId) && !player.isInjured
}
