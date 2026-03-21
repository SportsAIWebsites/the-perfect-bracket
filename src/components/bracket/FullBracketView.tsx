import { useState } from "react";
import { FullBracket } from "@/types/bracket";
import { RegionBracketStrip } from "./RegionBracketStrip";
import { FinalFourCenter } from "./FinalFourCenter";
import { TournamentLeaderboard } from "./TournamentLeaderboard";

interface FullBracketViewProps {
  bracket: FullBracket;
  isDemo?: boolean;
}

export function FullBracketView({
  bracket,
  isDemo = false,
}: FullBracketViewProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <div className="flex w-full">
      {/* Bracket — full size, scrollable */}
      <div className="flex-1 overflow-auto pb-8">
        <div className="inline-flex px-4 min-w-max">
          {/* Single unified bracket: Left regions | Final Four | Right regions */}
          <div className="flex items-center justify-center gap-2">
            {/* Left side: East (top) + South (bottom) */}
            <div className="flex flex-col gap-6">
              <RegionBracketStrip
                region={bracket.regions.East}
                isDemo={isDemo}
              />
              <RegionBracketStrip
                region={bracket.regions.South}
                isDemo={isDemo}
              />
            </div>

            {/* Center: Final Four — vertically centered between left/right stacks */}
            <div className="flex flex-col items-center justify-center">
              <FinalFourCenter
                finalFour={bracket.finalFour}
                isDemo={isDemo}
              />
            </div>

            {/* Right side: West (top) + Midwest (bottom) */}
            <div className="flex flex-col gap-6">
              <RegionBracketStrip
                region={bracket.regions.West}
                reverse
                isDemo={isDemo}
              />
              <RegionBracketStrip
                region={bracket.regions.Midwest}
                reverse
                isDemo={isDemo}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard toggle button */}
      {!showLeaderboard && (
        <button
          onClick={() => setShowLeaderboard(true)}
          className="fixed right-4 top-20 z-30 rounded-lg border border-border-subtle bg-card px-3 py-2 text-xs font-bold uppercase tracking-wider text-accent shadow-lg transition-colors hover:bg-accent/10"
        >
          Leaderboard
        </button>
      )}

      {/* Leaderboard sidebar */}
      {showLeaderboard && (
        <TournamentLeaderboard
          bracket={bracket}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
