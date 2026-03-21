export type NewsCategory = 'injury' | 'performance' | 'preview' | 'recap' | 'general'

export interface NewsItem {
  id: string
  headline: string
  summary: string
  publishedAt: string
  source: string
  url: string
  relatedTeamIds: string[]
  relatedPlayerIds: string[]
  category: NewsCategory
  isMock: boolean
}

export interface Highlight {
  id: string
  title: string
  playerIds: string[]
  teamIds: string[]
  gameId?: string
  youtubeIds: string[]  // fallback chain
  thumbnailUrl: string
  duration: string
  channel: string
  publishedAt: string
  isMock: boolean
}
