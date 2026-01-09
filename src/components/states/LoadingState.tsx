export function LoadingState() {
  return (
    <div className='flex items-center justify-center min-h-[60vh]'>
      <div className='text-center'>
        <div className='w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4' />
        <p className='text-muted-foreground'>Loading...</p>
      </div>
    </div>
  )
}
