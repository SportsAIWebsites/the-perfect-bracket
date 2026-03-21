import { useState } from 'react'
import { getHighlightsForPlayer, getHighlightsForTeam } from '../../mock/highlights'
import { Modal } from '../ui/Modal'

interface HighlightReelProps {
  playerId: string
  teamId: string
  playerName: string
}

export function HighlightReel({ playerId, teamId, playerName }: HighlightReelProps) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  const highlights = [
    ...getHighlightsForPlayer(playerId),
    ...getHighlightsForTeam(teamId).filter(h => !h.playerIds.includes(playerId)),
  ]

  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${playerName} March Madness 2026 highlights`)}`

  if (!highlights.length) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-500 mb-3">No curated highlights yet</div>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
        >
          ▶ Watch {playerName} highlights on YouTube →
        </a>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {highlights.slice(0, 4).map(h => (
          <div
            key={h.id}
            onClick={() => setActiveVideo(h.youtubeIds[0])}
            className="relative cursor-pointer group rounded-xl overflow-hidden bg-[#0C0C0C] border border-[#2C2C2C] hover:border-[#FFD10044] transition-all"
          >
            <img
              src={`https://img.youtube.com/vi/${h.youtubeIds[0]}/mqdefault.jpg`}
              alt={h.title}
              className="w-full aspect-video object-cover group-hover:opacity-80 transition-opacity"
              onError={e => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                <span className="text-black ml-0.5">▶</span>
              </div>
            </div>
            <div className="p-2">
              <div className="text-xs font-medium text-white line-clamp-2">{h.title}</div>
              <div className="text-[10px] text-slate-500 mt-1">{h.channel} · {h.duration}</div>
            </div>
          </div>
        ))}
      </div>

      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
      >
        ▶ More {playerName} highlights on YouTube
      </a>

      <Modal open={!!activeVideo} onClose={() => setActiveVideo(null)}>
        {activeVideo && (
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
