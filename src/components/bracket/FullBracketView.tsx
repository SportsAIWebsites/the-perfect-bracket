import { useState, useRef, useEffect } from "react";
import { FullBracket } from "@/types/bracket";
import { RegionBracketStrip } from "./RegionBracketStrip";
import { FinalFourCenter } from "./FinalFourCenter";
import { TournamentLeaderboard } from "./TournamentLeaderboard";

const BRACKET_WIDTH = 2400;

interface FullBracketViewProps {
  bracket: FullBracket;
  isDemo?: boolean;
}

export function FullBracketView({
  bracket,
  isDemo = false,
}: FullBracketViewProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bracketRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [bracketHeight, setBracketHeight] = useState(1600);

  useEffect(() => {
    function updateScale() {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.clientWidth;
      const newScale = Math.min(1, availableWidth / BRACKET_WIDTH);
      setScale(newScale);

      // Measure actual bracket height after render
      if (bracketRef.current) {
        setBracketHeight(bracketRef.current.scrollHeight);
      }
    }

    updateScale();

    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [bracket]);

  return (
    <div className="flex w-full">
      {/* Bracket */}
      <div ref={containerRef} className="min-w-0 flex-1 overflow-hidden pb-8">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: BRACKET_WIDTH,
            height: bracketHeight,
          }}
          ref={bracketRef}
        >
          <div className="px-4">
            {/* Single unified bracket: Left regions | Final Four | Right regions */}
            <div className="flex items-center justify-center gap-4">
              {/* Left side: East (top) + South (bottom) */}
              <div className="flex flex-col gap-8">
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
              <div className="flex flex-col gap-8">
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
        {/* Scaled container height */}
        <div style={{ height: Math.max(0, bracketHeight * scale - bracketHeight) }} />
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
