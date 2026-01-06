import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
// import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
// import { TanStackDevtools } from '@tanstack/react-devtools'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '@nanostores/react'

import { AuthProvider } from '../context/AuthContext'
import { CalendarProvider } from '../context/CalendarContext'
import { CalendarSidebar } from '../components/CalendarSidebar'
import { Button } from '../components/ui/button'
import { SidebarProvider, SidebarInset, useSidebar } from '../components/ui/sidebar'
import { $year } from '../components/calendar/calendar.store'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Year View Calendar',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  component: RootComponent,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <HeadContent />
      </head>
      <body className='h-screen overflow-hidden bg-background'>
        {children}
        {/* <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        /> */}
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  return (
    <AuthProvider>
      <CalendarProvider>
        <SidebarProvider defaultOpen={false}>
          <CalendarSidebar />
          <MainContent />
        </SidebarProvider>
      </CalendarProvider>
    </AuthProvider>
  )
}

function MainContent() {
  const { toggleSidebar, open } = useSidebar()
  const year = useStore($year)

  function handlePreviousYear() {
    $year.set(year - 1)
  }

  function handleNextYear() {
    $year.set(year + 1)
  }

  return (
    <SidebarInset className='h-screen overflow-auto'>
      {/* Header - 3 equal columns */}
      <header className='sticky top-0 z-50 grid grid-cols-3 h-12 shrink-0 items-center border-b bg-background px-4'>
        {/* Left: Show Calendars + Year View */}
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='sm' onClick={toggleSidebar} className='gap-2'>
            <CalendarIcon className='size-4' />
            <span>{open ? 'Hide Calendars' : 'Show Calendars'}</span>
          </Button>

          <span className='text-sm font-bold text-black'>Year View Calendar</span>
        </div>

        {/* Center: Year Navigation */}
        <div className='flex justify-center'>
          <div className='flex items-center gap-2'>
            <button
              onClick={handlePreviousYear}
              className='p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors'
              aria-label='Previous year'
            >
              <ChevronLeft className='w-5 h-5' />
            </button>

            <span className='text-lg font-bold text-stone-800 min-w-16 text-center'>{year}</span>

            <button
              onClick={handleNextYear}
              className='p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors'
              aria-label='Next year'
            >
              <ChevronRight className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Right: Empty for balance */}
        <div />
      </header>

      {/* Main Content */}
      <main className='flex-1'>
        <Outlet />
      </main>
    </SidebarInset>
  )
}
