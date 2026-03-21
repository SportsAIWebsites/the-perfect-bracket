import type { Highlight } from '../types/news'

// NCAA March Madness official YouTube channel highlights
// youtubeIds is a fallback chain — first valid ID is used
export const mockHighlights: Highlight[] = [
  {
    id: 'flagg-hl-1',
    title: 'Cooper Flagg | Top Plays & Highlights',
    playerIds: ['cooper-flagg'],
    teamIds: ['duke'],
    youtubeIds: ['dQw4w9WgXcQ', 'fHsa9DqmId8'],
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '3:24', channel: 'NCAA March Madness',
    publishedAt: '2026-03-19T18:00:00Z', isMock: true,
  },
  {
    id: 'flagg-hl-2',
    title: 'Duke vs Drake | First Round Highlights | 2026 NCAA Tournament',
    playerIds: ['cooper-flagg', 'kon-knueppel', 'khaman-maluach'],
    teamIds: ['duke'],
    gameId: 'g1',
    youtubeIds: ['dQw4w9WgXcQ'],
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '4:12', channel: 'NCAA March Madness',
    publishedAt: '2026-03-20T23:00:00Z', isMock: true,
  },
  {
    id: 'broome-hl-1',
    title: 'Johni Broome | Double-Double Machine | 2026 March Madness',
    playerIds: ['johni-broome'],
    teamIds: ['auburn'],
    youtubeIds: ['dQw4w9WgXcQ'],
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '2:58', channel: 'NCAA March Madness',
    publishedAt: '2026-03-20T22:00:00Z', isMock: true,
  },
  {
    id: 'sears-hl-1',
    title: 'Mark Sears | Scoring Champion | Alabama Highlights',
    playerIds: ['mark-sears'],
    teamIds: ['alabama'],
    youtubeIds: ['dQw4w9WgXcQ'],
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '3:41', channel: 'NCAA March Madness',
    publishedAt: '2026-03-19T20:00:00Z', isMock: true,
  },
  {
    id: 'duke-hl-1',
    title: 'Duke Blue Devils | 2026 NCAA Tournament Preview',
    playerIds: ['cooper-flagg', 'kon-knueppel', 'tyrese-proctor'],
    teamIds: ['duke'],
    youtubeIds: ['dQw4w9WgXcQ'],
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '5:02', channel: 'NCAA March Madness',
    publishedAt: '2026-03-18T16:00:00Z', isMock: true,
  },
]

export function getHighlightsForPlayer(playerId: string): Highlight[] {
  return mockHighlights.filter(h => h.playerIds.includes(playerId))
}

export function getHighlightsForTeam(teamId: string): Highlight[] {
  return mockHighlights.filter(h => h.teamIds.includes(teamId))
}
