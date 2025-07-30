import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonTableProps {
  columns: number
  rows: number
  headerHeight?: string
  rowHeight?: string
}

export function SkeletonTable({ columns, rows, headerHeight = "h-10", rowHeight = "h-12" }: SkeletonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton className={`w-3/4 ${headerHeight}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-200 dark:border-gray-700">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <Skeleton className={`w-full ${rowHeight}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
