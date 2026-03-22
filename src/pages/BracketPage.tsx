import { useSearchParams } from "react-router-dom";
import { useBracket } from "@/hooks/useBracket";
import { FullBracketView } from "@/components/bracket/FullBracketView";

export function BracketPage() {
  const { bracket, isLoading, error } = useBracket();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="mt-4 text-sm text-text-secondary">
          Loading bracket data...
        </p>
      </div>
    );
  }

  if (error || !bracket) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-live-red">Failed to load bracket data</p>
        <p className="mt-2 text-xs text-text-dim">
          Make sure the bracket API server is running on port 3000.
          Try adding ?demo=true for demo mode.
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-black text-white tracking-tight">
          The Perfect Bracket
        </h1>
      </div>
      <FullBracketView bracket={bracket} isDemo={isDemo} />
    </div>
  );
}
