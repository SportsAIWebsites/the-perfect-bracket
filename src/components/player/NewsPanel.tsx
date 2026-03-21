import { getNewsForPlayer, getNewsForTeam } from '../../mock/news'

interface NewsPanelProps {
  playerId: string
  teamId: string
}

export function NewsPanel({ playerId, teamId }: NewsPanelProps) {
  const news = [
    ...getNewsForPlayer(playerId),
    ...getNewsForTeam(teamId).filter(n => !n.relatedPlayerIds.includes(playerId)),
  ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  if (!news.length) {
    return <div className="text-center py-8 text-slate-500">No news items yet</div>
  }

  return (
    <div className="space-y-0">
      {news.map(item => (
        <div key={item.id} className="py-3 border-b border-[#2C2C2C] last:border-0">
          <div className="flex items-start gap-2 mb-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium mt-0.5 ${
              item.category === 'recap' ? 'bg-[#FFD10011] text-[#FFD100]' :
              item.category === 'injury' ? 'bg-red-500/20 text-red-400' :
              item.category === 'performance' ? 'bg-[#ff6b3511] text-[#ff6b35]' :
              'bg-[#2C2C2C] text-slate-400'
            }`}>
              {item.category.toUpperCase()}
            </span>
          </div>
          <div className="text-sm font-medium text-white leading-snug">{item.headline}</div>
          <div className="text-xs text-slate-400 mt-1">{item.summary}</div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
            <span>{item.source}</span>
            <span>·</span>
            <span>{new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
