import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

interface LoadingStateProps {
  type?: 'cards' | 'list' | 'detail'
  count?: number
}

export function LoadingState({ type = 'cards', count = 6 }: LoadingStateProps) {
  if (type === 'detail') {
    return (
      <div className="space-y-6" style={{ padding: '40px 20px' }}>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className="space-y-4" style={{ padding: '20px' }}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="cards-grid">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5 space-y-4">
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}
