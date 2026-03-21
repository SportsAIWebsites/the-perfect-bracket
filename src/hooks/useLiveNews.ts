import { useState, useEffect } from 'react'

interface LiveNewsItem {
  id: string
  headline: string
  summary: string
  publishedAt: string
  source: string
  url: string
  category: 'recap' | 'preview' | 'injury' | 'general' | 'performance'
}

interface UseLiveNewsReturn {
  news: LiveNewsItem[]
  loading: boolean
  error: string | null
}

const ESPN_NEWS_URL =
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/news?limit=25'

const POLL_INTERVAL_MS = 5 * 60_000 // 5 minutes

function mapCategory(
  categories: Array<{ description?: string }>
): LiveNewsItem['category'] {
  for (const cat of categories) {
    const desc = cat.description ?? ''
    if (desc.includes('Recap')) return 'recap'
    if (desc.includes('Preview')) return 'preview'
    if (desc.includes('Injury')) return 'injury'
    if (desc.includes('Performance') || desc.includes('Analysis')) return 'performance'
  }
  return 'general'
}

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}

function parseNews(data: unknown, existingCount: number): LiveNewsItem[] {
  const articles = (data as { articles?: unknown[] }).articles
  if (!Array.isArray(articles)) return []

  const items: LiveNewsItem[] = []

  articles.forEach((article, index) => {
    try {
      const a = article as {
        headline?: string
        description?: string
        published?: string
        links?: { web?: { href?: string } }
        source?: string
        categories?: Array<{ description?: string }>
      }

      const url = a.links?.web?.href ?? ''
      const id = url ? hashString(url) : `news-${existingCount + index}`

      items.push({
        id,
        headline: a.headline ?? '',
        summary: a.description ?? '',
        publishedAt: a.published ?? '',
        source: a.source || 'ESPN',
        url,
        category: mapCategory(a.categories ?? []),
      })
    } catch {
      // Skip malformed articles
    }
  })

  return items
}

export function useLiveNews(): UseLiveNewsReturn {
  const [news, setNews] = useState<LiveNewsItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchNews() {
      try {
        const response = await fetch(ESPN_NEWS_URL)
        if (!response.ok) {
          throw new Error(`ESPN API returned ${response.status}`)
        }
        const data = await response.json()
        if (!cancelled) {
          setNews(parseNews(data, 0))
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch news')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchNews()

    const intervalId = setInterval(fetchNews, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [])

  return { news, loading, error }
}
