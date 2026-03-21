interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-shimmer rounded-lg ${className}`} />
}

export function PlayerCardSkeleton() {
  return (
    <div className="bg-[#161616] border border-[#2C2C2C] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-12 w-16 rounded-lg" />
        <Skeleton className="h-12 w-16 rounded-lg" />
        <Skeleton className="h-12 w-16 rounded-lg" />
      </div>
    </div>
  )
}

export function NewsItemSkeleton() {
  return (
    <div className="space-y-2 py-3 border-b border-[#2C2C2C]">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}
