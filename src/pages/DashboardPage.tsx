

import { GlowCard } from '../components/ui/GlowCard'
import { LiveBadge } from '../components/ui/LiveBadge'
import { mockGames } from '../mock'
import { useFantasyStore } from '../store/useFantasyStore'

import { ROUND_CONFIGS } from '../types/fantasy'
import { useLiveScores } from '../hooks/useLiveScores'
import { useLiveNews } from '../hooks/useLiveNews'

// Fallback to mock games if ESPN API returns nothing (off-season / network issue)
function LiveGameCard({ game }: {
  game: {
    espnId: string
    homeTeam: string; homeAbbr: string; homeScore: number
    awayTeam: string; awayAbbr: string; awayScore: number
    status: 'scheduled' | 'in_progress' | 'final'
    clock: string; period: number; headline: string
  }
}) {
  const isLive = game.status === 'in_progress'
  const isFinal = game.status === 'final'
  const halfLabel = game.period === 1 ? '1st' : game.period === 2 ? '2nd' : `OT`
  const homeWin = isFinal && game.homeScore > game.awayScore
  const awayWin = isFinal && game.awayScore > game.homeScore

  return (
    <div className="min-w-[200px] bg-[#161616] border border-[#2C2C2C] rounded-xl p-3 flex flex-col gap-2 shrink-0">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider truncate max-w-[130px]">
          {game.headline || 'NCAA Tournament'}
        </span>
        {isLive && <LiveBadge />}
        {isFinal && <span className="text-[10px] text-slate-400 font-medium shrink-0">FINAL</span>}
        {game.status === 'scheduled' && <span className="text-[10px] text-slate-600 shrink-0">UPCOMING</span>}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-white truncate">{game.homeAbbr}</span>
          <span className={`text-sm font-bold tabular-nums shrink-0 ${homeWin ? 'text-[#FFD100]' : 'text-white'}`}>
            {game.homeScore}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-white truncate">{game.awayAbbr}</span>
          <span className={`text-sm font-bold tabular-nums shrink-0 ${awayWin ? 'text-[#FFD100]' : 'text-white'}`}>
            {game.awayScore}
          </span>
        </div>
      </div>
      {isLive && game.clock && (
        <div className="text-[10px] text-green-400">{game.clock} · {halfLabel} Half</div>
      )}
    </div>
  )
}

// Fallback card for mock games (when ESPN API unavailable)
function MockGameCard({ game }: { game: typeof mockGames[0] }) {
  const isLive = game.status === 'in_progress'
  const isFinal = game.status === 'final'
  return (
    <div className="min-w-[200px] bg-[#161616] border border-[#2C2C2C] rounded-xl p-3 flex flex-col gap-2 shrink-0">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{game.region} R{game.round}</span>
        {isLive && <LiveBadge />}
        {isFinal && <span className="text-[10px] text-slate-400 font-medium">FINAL</span>}
        {game.status === 'scheduled' && <span className="text-[10px] text-slate-600">UPCOMING</span>}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 w-4">{game.homeSeed}</span>
            <span className="text-sm font-semibold text-white">{game.homeTeamAbbr}</span>
          </div>
          <span className={`text-sm font-bold tabular-nums ${game.winnerId === game.homeTeamId ? 'text-[#FFD100]' : 'text-white'}`}>
            {game.homeScore}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 w-4">{game.awaySeed}</span>
            <span className="text-sm font-semibold text-white">{game.awayTeamAbbr}</span>
          </div>
          <span className={`text-sm font-bold tabular-nums ${game.winnerId === game.awayTeamId ? 'text-[#FFD100]' : 'text-white'}`}>
            {game.awayScore}
          </span>
        </div>
      </div>
      <div className="text-[10px] text-slate-600">{game.broadcastNetwork}</div>
    </div>
  )
}

export function DashboardPage() {
  const { currentRound } = useFantasyStore()
  const config = ROUND_CONFIGS.find(r => r.roundNumber === currentRound) ?? ROUND_CONFIGS[0]

  const { games: liveGames, loading: scoresLoading, lastUpdated } = useLiveScores()
  const { news, loading: newsLoading } = useLiveNews()


  // Decide which game source to render
  const useEspnGames = !scoresLoading && liveGames.length > 0
  const liveCount = useEspnGames
    ? liveGames.filter(g => g.status === 'in_progress').length
    : mockGames.filter(g => g.status === 'in_progress').length
  const finalCount = useEspnGames
    ? liveGames.filter(g => g.status === 'final').length
    : mockGames.filter(g => g.status === 'final').length

  return (
    <div className="space-y-6">
      {/* Live scores strip */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          {liveCount > 0 && <LiveBadge />}
          <h2 className="text-sm font-semibold text-white">
            {liveCount > 0 ? `${liveCount} Game${liveCount !== 1 ? 's' : ''} Live` : 'Scores'} — {config.label}
          </h2>
          <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
            {finalCount} final
            {lastUpdated && (
              <span className="text-slate-600 ml-1">
                · updated {lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            )}
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {useEspnGames ? (
            // Show live first, then final, then upcoming
            [
              ...liveGames.filter(g => g.status === 'in_progress'),
              ...liveGames.filter(g => g.status === 'final'),
              ...liveGames.filter(g => g.status === 'scheduled'),
            ].map(game => <LiveGameCard key={game.espnId} game={game} />)
          ) : (
            [
              ...mockGames.filter(g => g.status === 'in_progress'),
              ...mockGames.filter(g => g.status === 'final'),
              ...mockGames.filter(g => g.status === 'scheduled'),
            ].map(game => <MockGameCard key={game.id} game={game} />)
          )}
          {scoresLoading && (
            <div className="flex items-center justify-center min-w-[120px] text-xs text-slate-500">
              Loading scores...
            </div>
          )}
        </div>
      </div>

      {/* Side-by-side: Scores left, News right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — Today's Results */}
        <GlowCard>
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Today's Results</div>
          {!scoresLoading && liveGames.length > 0 ? (
            <div className="space-y-1">
              {[
                ...liveGames.filter(g => g.status === 'in_progress'),
                ...liveGames.filter(g => g.status === 'final'),
                ...liveGames.filter(g => g.status === 'scheduled'),
              ].map(game => {
                const isLive = game.status === 'in_progress'
                const isFinal = game.status === 'final'
                const homeWin = isFinal && game.homeScore > game.awayScore
                const awayWin = isFinal && game.awayScore > game.homeScore
                const halfLabel = game.period === 1 ? '1st' : game.period === 2 ? '2nd' : 'OT'

                return (
                  <div key={game.espnId} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#161616] transition-colors">
                    <span className={`w-14 text-xs font-semibold text-right truncate ${awayWin ? 'text-[#FFD100]' : isLive ? 'text-white' : 'text-slate-400'}`}>
                      {game.awayAbbr}
                    </span>
                    <span className={`w-8 text-xs font-bold tabular-nums text-right ${awayWin ? 'text-[#FFD100]' : 'text-white'}`}>
                      {game.status !== 'scheduled' ? game.awayScore : ''}
                    </span>
                    <span className="text-slate-600 text-xs">—</span>
                    <span className={`w-8 text-xs font-bold tabular-nums ${homeWin ? 'text-[#FFD100]' : 'text-white'}`}>
                      {game.status !== 'scheduled' ? game.homeScore : ''}
                    </span>
                    <span className={`w-14 text-xs font-semibold truncate ${homeWin ? 'text-[#FFD100]' : isLive ? 'text-white' : 'text-slate-400'}`}>
                      {game.homeAbbr}
                    </span>
                    <span className="ml-auto text-[10px] font-medium shrink-0">
                      {isLive && (
                        <span className="text-green-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          {game.clock} {halfLabel}
                        </span>
                      )}
                      {isFinal && <span className="text-slate-500">FINAL</span>}
                      {game.status === 'scheduled' && <span className="text-slate-600">TBD</span>}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">Loading scores...</div>
          )}
        </GlowCard>

        {/* RIGHT — Live News */}
        <GlowCard>
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            Latest News
            {!newsLoading && news.length > 0 && <span className="text-green-400 text-[10px]">● Live</span>}
          </div>
          {newsLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="border-b border-[#2C2C2C] pb-3 last:border-0">
                  <div className="h-4 bg-[#2C2C2C] rounded animate-pulse mb-1 w-4/5" />
                  <div className="h-3 bg-[#1C1C1C] rounded animate-pulse w-1/3" />
                </div>
              ))}
            </div>
          ) : news.length > 0 ? (
            <div className="space-y-3">
              {news.slice(0, 6).map(item => (
                <a
                  key={item.id}
                  href={item.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border-b border-[#2C2C2C] pb-3 last:border-0 last:pb-0 hover:bg-[#161616] -mx-1 px-1 rounded transition-colors"
                >
                  <div className="text-sm font-medium text-white leading-snug mb-1">{item.headline}</div>
                  {item.summary && (
                    <div className="text-xs text-slate-500 mb-1 line-clamp-2">{item.summary}</div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium uppercase ${
                      item.category === 'recap'       ? 'bg-[#FFD10022] text-[#FFD100]' :
                      item.category === 'preview'     ? 'bg-[#f9731622] text-[#f97316]' :
                      item.category === 'injury'      ? 'bg-red-900/30 text-red-400'    :
                      item.category === 'performance' ? 'bg-[#6366f122] text-indigo-400' :
                      'bg-[#2C2C2C] text-slate-400'
                    }`}>{item.category}</span>
                    <span>{item.source}</span>
                    <span>·</span>
                    <span>{new Date(item.publishedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">No news available</div>
          )}
        </GlowCard>
      </div>
    </div>
  )
}
