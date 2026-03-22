import type { PlayerGameLog } from '../types/game'

/**
 * Actual box score stats from completed 2026 NCAA Tournament games.
 * Used by the scoring engine to compute real fantasy points instead of projections.
 * Keyed as [playerId]: PlayerGameLog[]
 */
const logs: PlayerGameLog[] = [
  // ── g1: Duke 71, Siena 65 ─────────────────────────────────────────
  { playerId: 'cameron-boozer',     gameId: 'g1', teamId: 'duke',  points: 24, rebounds: 11, assists: 3, steals: 1, blocks: 2, turnovers: 2, fouls: 3, minutesPlayed: 36 },
  { playerId: 'maliq-brown',        gameId: 'g1', teamId: 'duke',  points: 16, rebounds:  8, assists: 2, steals: 2, blocks: 1, turnovers: 1, fouls: 2, minutesPlayed: 32 },
  { playerId: 'cayden-boozer',      gameId: 'g1', teamId: 'duke',  points: 12, rebounds:  4, assists: 5, steals: 1, blocks: 0, turnovers: 2, fouls: 3, minutesPlayed: 30 },
  { playerId: 'kon-knueppel',       gameId: 'g1', teamId: 'duke',  points: 11, rebounds:  2, assists: 1, steals: 0, blocks: 0, turnovers: 1, fouls: 2, minutesPlayed: 28 },
  { playerId: 'gavin-doty',         gameId: 'g1', teamId: 'siena', points: 22, rebounds:  8, assists: 2, steals: 1, blocks: 0, turnovers: 3, fouls: 4, minutesPlayed: 38 },
  { playerId: 'justice-shoats',     gameId: 'g1', teamId: 'siena', points: 14, rebounds:  3, assists: 6, steals: 2, blocks: 0, turnovers: 2, fouls: 3, minutesPlayed: 36 },
  { playerId: 'francis-folefac',    gameId: 'g1', teamId: 'siena', points:  9, rebounds:  6, assists: 1, steals: 0, blocks: 2, turnovers: 1, fouls: 4, minutesPlayed: 28 },

  // ── g2: TCU 66, Ohio St 64 ────────────────────────────────────────
  { playerId: 'bruce-thornton',     gameId: 'g2', teamId: 'ohio-st', points: 21, rebounds:  3, assists: 7, steals: 2, blocks: 0, turnovers: 3, fouls: 2, minutesPlayed: 38 },
  { playerId: 'felix-okpara',       gameId: 'g2', teamId: 'ohio-st', points: 13, rebounds: 10, assists: 1, steals: 0, blocks: 3, turnovers: 2, fouls: 4, minutesPlayed: 32 },
  { playerId: 'micah-parrish',      gameId: 'g2', teamId: 'ohio-st', points: 15, rebounds:  5, assists: 3, steals: 1, blocks: 0, turnovers: 1, fouls: 3, minutesPlayed: 34 },

  // ── g3: Michigan St 92, N. Dakota St 67 ──────────────────────────
  { playerId: 'jeremy-fears',       gameId: 'g3', teamId: 'michigan-st',    points: 26, rebounds:  4, assists: 8, steals: 3, blocks: 0, turnovers: 2, fouls: 1, minutesPlayed: 36 },
  { playerId: 'jaxon-kohler',       gameId: 'g3', teamId: 'michigan-st',    points: 18, rebounds:  9, assists: 2, steals: 0, blocks: 2, turnovers: 1, fouls: 3, minutesPlayed: 30 },
  { playerId: 'damari-wheeler-thomas', gameId: 'g3', teamId: 'ndsu',        points: 19, rebounds:  4, assists: 3, steals: 2, blocks: 0, turnovers: 2, fouls: 3, minutesPlayed: 36 },
  { playerId: 'trevian-carson',     gameId: 'g3', teamId: 'ndsu',           points: 14, rebounds:  7, assists: 3, steals: 2, blocks: 0, turnovers: 1, fouls: 4, minutesPlayed: 32 },

  // ── g4: Louisville 83, South Florida 79 ──────────────────────────
  { playerId: 'mikel-brown',        gameId: 'g4', teamId: 'louisville',     points: 22, rebounds:  4, assists: 4, steals: 2, blocks: 0, turnovers: 2, fouls: 2, minutesPlayed: 37 },
  { playerId: 'chucky-hepburn',     gameId: 'g4', teamId: 'louisville',     points: 18, rebounds:  3, assists: 7, steals: 1, blocks: 0, turnovers: 3, fouls: 2, minutesPlayed: 36 },
  { playerId: 'izaiyah-nelson',     gameId: 'g4', teamId: 'south-florida',  points: 21, rebounds: 12, assists: 1, steals: 2, blocks: 2, turnovers: 2, fouls: 4, minutesPlayed: 38 },
  { playerId: 'wes-enis',           gameId: 'g4', teamId: 'south-florida',  points: 18, rebounds:  4, assists: 3, steals: 1, blocks: 0, turnovers: 2, fouls: 3, minutesPlayed: 35 },
  { playerId: 'joseph-pinion',      gameId: 'g4', teamId: 'south-florida',  points: 16, rebounds:  4, assists: 2, steals: 2, blocks: 0, turnovers: 1, fouls: 3, minutesPlayed: 33 },

  // ── g7: Houston 78, Idaho 47 ──────────────────────────────────────
  { playerId: 'milos-uzan',         gameId: 'g7', teamId: 'houston', points: 19, rebounds:  3, assists: 9, steals: 2, blocks: 0, turnovers: 1, fouls: 1, minutesPlayed: 34 },
  { playerId: 'tramon-mark',        gameId: 'g7', teamId: 'houston', points: 16, rebounds:  5, assists: 2, steals: 3, blocks: 1, turnovers: 1, fouls: 2, minutesPlayed: 30 },
  { playerId: 'kolton-mitchell',    gameId: 'g7', teamId: 'idaho',   points: 14, rebounds:  4, assists: 3, steals: 1, blocks: 0, turnovers: 2, fouls: 4, minutesPlayed: 32 },
  { playerId: 'jackson-rasmussen',  gameId: 'g7', teamId: 'idaho',   points: 11, rebounds:  5, assists: 1, steals: 0, blocks: 1, turnovers: 2, fouls: 3, minutesPlayed: 28 },

  // ── g8: Gonzaga 73, Kennesaw State 64 ────────────────────────────
  { playerId: 'braden-huff',        gameId: 'g8', teamId: 'gonzaga',         points: 22, rebounds:  8, assists: 2, steals: 1, blocks: 2, turnovers: 2, fouls: 3, minutesPlayed: 34 },
  { playerId: 'graham-ike-ii',      gameId: 'g8', teamId: 'gonzaga',         points: 16, rebounds: 10, assists: 3, steals: 0, blocks: 2, turnovers: 2, fouls: 4, minutesPlayed: 32 },
  { playerId: 'simeon-cottle',      gameId: 'g8', teamId: 'kennesaw-state',  points: 24, rebounds:  3, assists: 4, steals: 1, blocks: 0, turnovers: 2, fouls: 3, minutesPlayed: 38 },
  { playerId: 'rj-johnson',         gameId: 'g8', teamId: 'kennesaw-state',  points: 16, rebounds:  4, assists: 5, steals: 1, blocks: 0, turnovers: 2, fouls: 3, minutesPlayed: 35 },

  // ── g9: High Point 83, Wisconsin 82 ──────────────────────────────
  { playerId: 'trevion-boyd',       gameId: 'g9', teamId: 'high-point', points: 28, rebounds:  6, assists: 4, steals: 2, blocks: 1, turnovers: 2, fouls: 2, minutesPlayed: 40 },

  // ── g10: Texas 79, BYU 71 ─────────────────────────────────────────
  { playerId: 'aj-dybantsa',        gameId: 'g10', teamId: 'byu', points: 28, rebounds:  8, assists: 4, steals: 2, blocks: 1, turnovers: 3, fouls: 2, minutesPlayed: 38 },

  // ── g11: Texas A&M 63, Saint Mary's 50 ───────────────────────────
  { playerId: 'paulius-murauskas',  gameId: 'g11', teamId: 'saint-marys', points: 18, rebounds:  9, assists: 2, steals: 0, blocks: 2, turnovers: 2, fouls: 4, minutesPlayed: 34 },

  // ── g12: Arizona 58, LIU 41 (in-progress) ────────────────────────
  { playerId: 'brayden-burries',    gameId: 'g12', teamId: 'arizona', points: 17, rebounds:  4, assists: 3, steals: 2, blocks: 0, turnovers: 1, fouls: 1, minutesPlayed: 28 },
  { playerId: 'jaden-bradley',      gameId: 'g12', teamId: 'arizona', points: 14, rebounds:  2, assists: 6, steals: 1, blocks: 0, turnovers: 2, fouls: 2, minutesPlayed: 26 },
  { playerId: 'jamal-fuller',       gameId: 'g12', teamId: 'liu',     points: 14, rebounds:  5, assists: 2, steals: 1, blocks: 0, turnovers: 2, fouls: 3, minutesPlayed: 26 },

  // ── g13: Arkansas 97, Hawaii 78 ───────────────────────────────────
  { playerId: 'darius-acuff',       gameId: 'g13', teamId: 'arkansas', points: 26, rebounds:  4, assists: 7, steals: 2, blocks: 0, turnovers: 2, fouls: 2, minutesPlayed: 35 },
  { playerId: 'adou-thiero',        gameId: 'g13', teamId: 'arkansas', points: 19, rebounds:  9, assists: 2, steals: 1, blocks: 1, turnovers: 2, fouls: 3, minutesPlayed: 32 },
  { playerId: 'isaac-johnson',      gameId: 'g13', teamId: 'hawaii',   points: 17, rebounds:  7, assists: 1, steals: 0, blocks: 1, turnovers: 2, fouls: 4, minutesPlayed: 34 },
  { playerId: 'quandre-bullock',    gameId: 'g13', teamId: 'hawaii',   points: 21, rebounds:  7, assists: 2, steals: 2, blocks: 0, turnovers: 2, fouls: 3, minutesPlayed: 36 },

  // ── g14: Michigan 101, Howard 80 ──────────────────────────────────
  { playerId: 'yaxel-lendeborg',    gameId: 'g14', teamId: 'michigan', points: 22, rebounds: 10, assists: 2, steals: 1, blocks: 2, turnovers: 2, fouls: 3, minutesPlayed: 32 },
  { playerId: 'tre-donaldson',      gameId: 'g14', teamId: 'michigan', points: 18, rebounds:  3, assists: 8, steals: 2, blocks: 0, turnovers: 1, fouls: 2, minutesPlayed: 34 },
  { playerId: 'ridley-coleby',      gameId: 'g14', teamId: 'howard',   points: 20, rebounds:  8, assists: 2, steals: 1, blocks: 2, turnovers: 2, fouls: 4, minutesPlayed: 36 },
  { playerId: 'elijah-hawkins',     gameId: 'g14', teamId: 'howard',   points: 18, rebounds:  3, assists: 6, steals: 2, blocks: 0, turnovers: 3, fouls: 3, minutesPlayed: 34 },

  // ── g15: Illinois 105, Penn 70 ────────────────────────────────────
  { playerId: 'dra-gibbs-lawson',   gameId: 'g15', teamId: 'illinois', points: 26, rebounds:  5, assists: 4, steals: 2, blocks: 1, turnovers: 2, fouls: 2, minutesPlayed: 34 },
  { playerId: 'will-riley',         gameId: 'g15', teamId: 'illinois', points: 21, rebounds:  4, assists: 3, steals: 1, blocks: 0, turnovers: 1, fouls: 2, minutesPlayed: 30 },

  // ── g16: Nebraska 76, Troy 47 ─────────────────────────────────────
  { playerId: 'brice-williams',     gameId: 'g16', teamId: 'nebraska', points: 20, rebounds:  5, assists: 3, steals: 1, blocks: 0, turnovers: 1, fouls: 2, minutesPlayed: 30 },

  // ── g17: Saint Louis 102, Georgia 77 ──────────────────────────────
  { playerId: 'gibson-jimerson',    gameId: 'g17', teamId: 'saint-louis', points: 24, rebounds:  4, assists: 4, steals: 2, blocks: 0, turnovers: 1, fouls: 2, minutesPlayed: 34 },

  // ── g19: VCU 82, UNC 78 ───────────────────────────────────────────
  { playerId: 'max-shulga',         gameId: 'g19', teamId: 'vcu',           points: 22, rebounds:  4, assists: 6, steals: 2, blocks: 0, turnovers: 2, fouls: 2, minutesPlayed: 38 },

  // ── g20: Vanderbilt 78, McNeese 68 ───────────────────────────────
  { playerId: 'tyrin-lawrence',     gameId: 'g20', teamId: 'vanderbilt', points: 21, rebounds:  4, assists: 4, steals: 1, blocks: 0, turnovers: 2, fouls: 3, minutesPlayed: 36 },
  { playerId: 'aj-hoggard',         gameId: 'g20', teamId: 'vanderbilt', points: 16, rebounds:  3, assists: 7, steals: 1, blocks: 0, turnovers: 2, fouls: 2, minutesPlayed: 34 },

  // ── ROUND 2 RESULTS (March 21–22, 2026) ─────────────────────────────

  // ── r2-g1: Duke 81, TCU 58 ──────────────────────────────────────────
  { playerId: 'cameron-boozer',    gameId: 'r2-g1', teamId: 'duke',  points: 22, rebounds: 13, assists: 3, steals: 0, blocks: 1, turnovers: 5, fouls: 1, minutesPlayed: 39 },
  { playerId: 'cayden-boozer',     gameId: 'r2-g1', teamId: 'duke',  points: 19, rebounds:  2, assists: 5, steals: 2, blocks: 0, turnovers: 0, fouls: 1, minutesPlayed: 39 },
  { playerId: 'maliq-brown',      gameId: 'r2-g1', teamId: 'duke',  points: 14, rebounds:  7, assists: 2, steals: 1, blocks: 2, turnovers: 1, fouls: 2, minutesPlayed: 34 },
  { playerId: 'kon-knueppel',     gameId: 'r2-g1', teamId: 'duke',  points: 13, rebounds:  3, assists: 4, steals: 0, blocks: 0, turnovers: 1, fouls: 2, minutesPlayed: 32 },

  // ── r2-g2: Arkansas 94, High Point 88 ───────────────────────────────
  { playerId: 'darius-acuff',     gameId: 'r2-g2', teamId: 'arkansas', points: 36, rebounds: 1, assists: 6, steals: 1, blocks: 0, turnovers: 2, fouls: 2, minutesPlayed: 34 },
  { playerId: 'meleek-thomas',    gameId: 'r2-g2', teamId: 'arkansas', points: 19, rebounds: 4, assists: 3, steals: 1, blocks: 0, turnovers: 2, fouls: 3, minutesPlayed: 36 },
  { playerId: 'malique-ewin',     gameId: 'r2-g2', teamId: 'arkansas', points: 14, rebounds: 12, assists: 1, steals: 0, blocks: 1, turnovers: 1, fouls: 4, minutesPlayed: 32 },
  { playerId: 'trevion-boyd',     gameId: 'r2-g2', teamId: 'high-point', points: 30, rebounds: 5, assists: 4, steals: 1, blocks: 0, turnovers: 3, fouls: 3, minutesPlayed: 40 },

  // ── r2-g3: Michigan St 77, Louisville 69 ────────────────────────────
  { playerId: 'jeremy-fears',     gameId: 'r2-g3', teamId: 'michigan-st', points: 12, rebounds: 3, assists: 16, steals: 1, blocks: 0, turnovers: 2, fouls: 1, minutesPlayed: 38 },
  { playerId: 'coen-carr',        gameId: 'r2-g3', teamId: 'michigan-st', points: 21, rebounds: 10, assists: 2, steals: 1, blocks: 2, turnovers: 2, fouls: 3, minutesPlayed: 36 },
  { playerId: 'jaxon-kohler',     gameId: 'r2-g3', teamId: 'michigan-st', points: 14, rebounds: 6, assists: 1, steals: 0, blocks: 1, turnovers: 1, fouls: 4, minutesPlayed: 28 },
  { playerId: 'mikel-brown',      gameId: 'r2-g3', teamId: 'louisville',  points: 20, rebounds: 3, assists: 5, steals: 1, blocks: 0, turnovers: 3, fouls: 3, minutesPlayed: 38 },
  { playerId: 'chucky-hepburn',   gameId: 'r2-g3', teamId: 'louisville',  points: 16, rebounds: 2, assists: 6, steals: 0, blocks: 0, turnovers: 4, fouls: 2, minutesPlayed: 36 },
]

/** Look up a player's box score for a specific game. */
export function getPlayerGameLog(playerId: string, gameId: string): PlayerGameLog | null {
  return logs.find(l => l.playerId === playerId && l.gameId === gameId) ?? null
}

/** Get all game logs for a player. */
export function getPlayerLogs(playerId: string): PlayerGameLog[] {
  return logs.filter(l => l.playerId === playerId)
}

/** Get all logs for a game. */
export function getGameLogs(gameId: string): PlayerGameLog[] {
  return logs.filter(l => l.gameId === gameId)
}

export interface TournamentStats {
  ppg: number; rpg: number; apg: number; spg: number; bpg: number
  topg: number  // turnovers
  fpg: number   // fouls
  games: number
}

/** Aggregate per-game tournament averages for a player. Returns null if no logs exist. */
export function getTournamentStats(playerId: string): TournamentStats | null {
  const playerLogs = logs.filter(l => l.playerId === playerId)
  if (playerLogs.length === 0) return null
  const g = playerLogs.length
  return {
    ppg:  playerLogs.reduce((s, l) => s + l.points,    0) / g,
    rpg:  playerLogs.reduce((s, l) => s + l.rebounds,  0) / g,
    apg:  playerLogs.reduce((s, l) => s + l.assists,   0) / g,
    spg:  playerLogs.reduce((s, l) => s + l.steals,    0) / g,
    bpg:  playerLogs.reduce((s, l) => s + l.blocks,    0) / g,
    topg: playerLogs.reduce((s, l) => s + l.turnovers, 0) / g,
    fpg:  playerLogs.reduce((s, l) => s + l.fouls,     0) / g,
    games: g,
  }
}

/** Get all unique player IDs that have tournament logs. */
export function getPlayersWithLogs(): string[] {
  return [...new Set(logs.map(l => l.playerId))]
}

export { logs as allPlayerGameLogs }
