import { Column } from '../../styles'

export function LoadingEventsOverlay() {
  return (
    <div className='pointer-events-none fixed inset-0 z-50 flex items-center justify-center'>
      <Column className='items-center gap-3 rounded-xl bg-background/90 px-6 py-4 shadow-lg backdrop-blur-sm border border-border/50'>
        <div className='h-5 w-5 animate-spin rounded-full border-2 border-brand-red border-t-transparent' />
        <p className='text-sm font-medium text-foreground'>Loading events...</p>
      </Column>
    </div>
  )
}
