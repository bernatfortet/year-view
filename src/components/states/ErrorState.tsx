type Props = {
  error: string
}

export function ErrorState(props: Props) {
  const { error } = props

  return (
    <div className='flex items-center justify-center min-h-[60vh]'>
      <div className='text-center max-w-md mx-auto px-4'>
        <div className='w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6'>
          <svg className='w-8 h-8 text-red-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
            />
          </svg>
        </div>

        <h2 className='text-xl font-bold mb-3'>Failed to Load Events</h2>

        <p className='text-muted-foreground mb-6'>{error}</p>

        <button
          onClick={() => window.location.reload()}
          className='px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red/90 transition-colors'
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
