import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function UserPagination({
  page,
  totalPages,
  onPageChange,
  isLoading = false,
}: UserPaginationProps) {
  const canGoPrevious = page > 1
  const canGoNext = page < totalPages

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={!canGoPrevious || isLoading}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center justify-center min-w-[80px] px-3 py-1.5 text-sm font-medium">
        {page} / {totalPages || 1}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={!canGoNext || isLoading}
      >
        Next
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  )
}

