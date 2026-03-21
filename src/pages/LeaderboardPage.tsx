import { useMemo } from 'react'
import { GlowCard } from '../components/ui/GlowCard'
import { useFantasyStore } from '../store/useFantasyStore'
import { useLiveFantasyScoring } from '../hooks/useLiveFantasyScoring'

const prizeStructure = [
  { rank: '#1 Overall',    prize: '$500', icon: '🥇', color: 'text-yellow-400' },
  { rank: '#2 – #5',      prize: '$100', icon: '🥈', color: 'text-slate-300' },
  { rank: '#6 – #10',     prize: '$50',  icon: '🥉', color: 'text-amber-600' },
  { rank: 'Round Winner', prize: '$25',  icon: '🏆', color: 'text-[#FFD100]' },
  { rank: 'Cinderella Pick', prize: '$10', icon: '🔥', color: 'text-[#ff6b35]' },
]

// Simulated competitors for demo purposes
const MOCK_OPPONENTS = [
  { name: 'BracketBuster99', r1: 198.5, delta: '+1' },
  { name: 'CinderellaFC',    r1: 187.0, delta: '+3' },
  { name: 'HoopsDreamer',    r1: 176.5, delta: '-1' },
  { name: 'UpsetsOnly',      r1: 164.0, delta: '+2' },
  { name: 'ChalkPickers',    r1: 158.5, delta: '0'  },
  { name: 'NeonHoops',       r1: 151.0, delta: '-2' },
  { name: 'DarkHorseDen',    r1: 143.5, delta: '+4' },
  { name: 'MarchMayhemCo',   r1: 134.0, delta: '-1' },
]

const RANK_COLORS = ['text-yellow-400', 'text-slate-300', 'text-amber-600']

export function LeaderboardPage() {
  const { draftedPlayers, currentRound, cumulativePoints } = useFantasyStore()
  const { scores, loading } = useLiveFantasyScoring(draftedPlayers, currentRound)

  const actualCurrentTotal = useMemo(() =>
    Array.from(scores.values()).filter(s => s.isActual).reduce((sum, s) => sum + s.fantasyPoints, 0),
  [scores])

  const yourTotal = cumulativePoints() + (loading ? 0 : actualCurrentTotal)

  // Insert "You" into the sorted leaderboard
  const rows = useMemo(() => {
    const opponents = MOCK_OPPONENTS.map((o, i) => ({
      name: o.name, score: o.r1, delta: o.delta, isYou: false, opponentIdx: i,
    }))
    const you = { name: 'You', score: yourTotal, delta: '-', isYou: true, opponentIdx: -1 }
    return [...opponents, you]
      .sort((a, b) => b.score - a.score)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }))
  }, [yourTotal])

  const youRow = rows.find(r => r.isYou)!

  return (
    <div className="space-y-6">
      {/* Prize structure */}
      <GlowCard>
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">2026 Prize Structure</div>
        <div className="grid grid-cols-5 gap-3">
          {prizeStructure.map(p => (
            <div key={p.rank} className="text-center">
              <div className="text-2xl mb-1">{p.icon}</div>
              <div className={`text-lg font-bold ${p.color}`}>{p.prize}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{p.rank}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-[#2C2C2C] text-[10px] text-slate-600">
          * Cinderella Pick: drafted a seed 12+ team player who reaches the Elite Eight
        </div>
      </GlowCard>

      {/* Your Ranking — always at top */}
      <GlowCard>
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Your Ranking</div>
        <div className="bg-[#FFD10008] border border-[#FFD10030] rounded-xl p-4 flex items-center gap-4">
          <div className="text-3xl font-black text-[#FFD100] tabular-nums">#{youRow.rank}</div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-[#FFD100]">You</div>
            <div className="text-xs text-slate-500">of {rows.length} participants</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-[#FFD100] tabular-nums">{youRow.score.toFixed(1)}</div>
            <div className="text-[10px] text-slate-500">total points</div>
          </div>
        </div>
      </GlowCard>

      {/* Full Standings */}
      <GlowCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold text-white">Full Standings</div>
            <div className="text-xs text-slate-500">{rows.length} participants · Second Round</div>
          </div>
        </div>

        <div className="space-y-1">
          {rows.map(entry => (
            <LeaderRow
              key={entry.name}
              rank={entry.rank}
              name={entry.isYou ? 'You' : entry.name}
              score={entry.score}
              delta={entry.isYou ? '—' : entry.delta}
              isYou={entry.isYou}
            />
          ))}
        </div>
      </GlowCard>
    </div>
  )
}

function LeaderRow({ rank, name, score, delta, isYou }: {
  rank: number; name: string; score: number; delta: string; isYou: boolean
}) {
  const isTop3 = rank <= 3
  return (
    <div className={`flex items-center gap-4 px-3 py-2.5 rounded-lg ${isYou ? 'bg-[#FFD10010] border border-[#FFD10030]' : 'hover:bg-[#161616]'}`}>
      <span className={`w-8 text-sm font-bold tabular-nums ${isTop3 ? RANK_COLORS[rank - 1] : 'text-slate-500'}`}>
        #{rank}
      </span>
      <div className="w-8 h-8 rounded-full bg-[#2C2C2C] flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
        {name[0]}
      </div>
      <span className={`flex-1 text-sm font-medium ${isYou ? 'text-[#FFD100]' : 'text-white'}`}>
        {name} {isYou && '(You)'}
      </span>
      <span className="text-xs text-slate-600 w-6 text-right">{delta}</span>
      <span className={`text-sm font-bold tabular-nums ${isYou ? 'text-[#FFD100]' : 'text-white'}`}>
        {score.toFixed(1)}
      </span>
    </div>
  )
}
