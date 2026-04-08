import { Search, FileQuestionMark as FileQuestion, ListFilter as Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: 'search' | 'empty' | 'filter'
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  title = 'No results found',
  description = 'Try adjusting your filters or search terms',
  icon = 'empty',
  action
}: EmptyStateProps) {
  const Icon = icon === 'search' ? Search : icon === 'filter' ? Filter : FileQuestion

  return (
    <div className="flex items-center justify-center" style={{ padding: '80px 20px' }}>
      <Alert className="max-w-md border-border">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-muted p-4">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <AlertTitle className="text-lg font-semibold">{title}</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              {description}
            </AlertDescription>
          </div>
          {action && (
            <Button onClick={action.onClick} variant="outline">
              {action.label}
            </Button>
          )}
        </div>
      </Alert>
    </div>
  )
}
