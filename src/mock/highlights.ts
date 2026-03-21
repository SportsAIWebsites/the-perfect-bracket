import type { Highlight } from '../types/news'

// Empty — highlights are sourced via YouTube search links in HighlightReel component
export const mockHighlights: Highlight[] = []

export function getHighlightsForPlayer(_playerId: string): Highlight[] {
  return []
}

export function getHighlightsForTeam(_teamId: string): Highlight[] {
  return []
}
