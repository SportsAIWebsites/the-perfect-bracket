interface HighlightReelProps {
  playerId: string
  teamId: string
  playerName: string
}

export function HighlightReel({ playerName }: HighlightReelProps) {
  const playerSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${playerName} March Madness 2026 highlights`)}`
  const teamName = playerName.split(' ').pop() ?? playerName

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
