export function NoCalendarsState() {
  return (
    <div className='flex items-center justify-center min-h-[60vh]'>
      <div className='text-center max-w-md mx-auto px-4'>
        <div className='w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6'>
          <svg className='w-8 h-8 text-muted-foreground' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
            />
          </svg>
        </div>

        <h2 className='text-xl font-semibold mb-3'>No Calendars Selected</h2>

        <p className='text-muted-foreground'>Select one or more calendars from the sidebar to view events.</p>
      </div>
    </div>
  )
}
