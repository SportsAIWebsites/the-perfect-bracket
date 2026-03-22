interface HighlightReelProps {
  playerId: string
  teamId: string
  playerName: string
}

// Curated highlights for featured players
const FEATURED_HIGHLIGHTS: Record<string, { title: string; description: string; url: string; thumbnail: string }[]> = {
  'Jeremy Fears Jr.': [
    {
      title: '16 Assists — MSU Record vs Louisville',
      description: 'Fears breaks Magic Johnson\'s 50-year-old Michigan State NCAA Tournament assist record with 16 dimes in a 77-69 win over Louisville.',
      url: 'https://www.ncaa.com/video/basketball-men/2026-03-21/michigan-state-spartans-vs-louisville-cardinals-game-highlights-202621707',
      thumbnail: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mens-college-basketball/players/full/5105962.png&w=350&h=254',
    },
    {
      title: '11 Assists & 15 Pts vs North Dakota State',
      description: 'Fears leads MSU to a dominant 92-67 R1 win with 11 assists — second-most in Spartan tournament history.',
      url: 'https://www.ncaa.com/video/basketball-men/2026-03-21/michigan-state-spartans-vs-louisville-cardinals-condensed-game-202621708',
      thumbnail: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mens-college-basketball/players/full/5105962.png&w=350&h=254',
    },
  ],
  'Darius Acuff Jr.': [
    {
      title: '36 Pts — Arkansas Record vs High Point',
      description: 'Acuff scores 36 points and 6 assists in a 94-88 win over High Point, setting the Arkansas NCAA Tournament scoring record.',
      url: 'https://www.ncaa.com/video/basketball-men/2026-03-22/darius-acuff-jr-rob-martin-go-back-and-forth-late-night-march-madness-battle',
      thumbnail: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mens-college-basketball/players/full/5105880.png&w=350&h=254',
    },
    {
      title: '24 Pts, 7 Ast — March Madness Debut vs Hawaii',
      description: 'Acuff drops 24 points and 7 assists as Arkansas cruises to a 97-78 first-round win.',
      url: 'https://www.ncaa.com/video/basketball-men/2026-03-19/darius-acuff-jr-drops-24-points-7-assists-march-madness-debut-vs-hawaii',
      thumbnail: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mens-college-basketball/players/full/5105880.png&w=350&h=254',
    },
  ],
}

export function HighlightReel({ playerName }: HighlightReelProps) {
  const playerSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${playerName} March Madness 2026 highlights`)}`
  const teamName = playerName.split(' ').pop() ?? playerName
  const featured = FEATURED_HIGHLIGHTS[playerName]

  if (featured) {
    return (
      <div className="space-y-3">
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Featured Highlights</div>
        {featured.map((h, i) => (
          <a
            key={i}
            href={h.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 p-3 rounded-lg bg-[#161616] border border-[#2C2C2C] hover:border-[#FFD10044] transition-colors group"
          >
            <div className="w-16 h-16 rounded-lg bg-[#0C0C0C] flex items-center justify-center shrink-0 overflow-hidden relative">
              <img
                src={h.thumbnail}
                alt={playerName}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-white text-lg">▶</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white group-hover:text-[#FFD100] transition-colors">{h.title}</div>
              <div className="text-xs text-slate-500 mt-1 line-clamp-2">{h.description}</div>
            </div>
          </a>
        ))}
        <div className="text-center pt-2">
          <a
            href={playerSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            More highlights on YouTube →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-6 space-y-3">
      <div className="text-slate-500 text-sm mb-4">Watch highlights on YouTube</div>
      <a
        href={playerSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
      >
        ▶ {playerName} Highlights
      </a>
      <div>
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${teamName} March Madness 2026`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
        >
          Search team highlights →
        </a>
      </div>
    </div>
  )
}
