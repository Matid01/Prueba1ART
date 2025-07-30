import { SkeletonCard } from "@/components/ui/skeleton-card"
import { SkeletonTable } from "@/components/ui/skeleton-table"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8">
        <div className="h-8 bg-muted rounded w-1/3 mb-2" />
        <div className="h-5 bg-muted rounded w-1/2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SkeletonCard count={4} />
      </div>

      <div className="h-10 bg-muted rounded w-full mb-4" />

      <div className="bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 bg-background border-b border-border">
          <div className="h-6 bg-muted rounded w-1/4 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        <div className="p-0">
          <SkeletonTable columns={6} rows={8} />
        </div>
      </div>
    </div>
  )
}
