import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { useStore } from '@nanostores/react'

import { AuthProvider } from '../context/AuthContext'
import { CalendarProvider } from '../context/CalendarContext'
import { CalendarSidebar } from '../components/CalendarSidebar'
import { Nav } from '../components/Nav'
import { $sidebarOpen, toggleSidebar } from '../stores/sidebar.store'
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
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  return (
    <AuthProvider>
      <CalendarProvider>
        <AppLayout />
      </CalendarProvider>
    </AuthProvider>
  )
}

function AppLayout() {
  const sidebarOpen = useStore($sidebarOpen)

  return (
    <div className='flex h-screen flex-col'>
      <Nav />

      {/* Content area with floating sidebar */}
      <div className='relative flex-1 overflow-hidden'>
        {/* Floating Sidebar */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div className='absolute inset-0 z-30 bg-black/20' onClick={toggleSidebar} />

            {/* Sidebar Panel */}
            <div className='absolute left-0 top-0 z-40 h-full w-72 border-r bg-background shadow-lg'>
              <CalendarSidebar />
            </div>
          </>
        )}

        {/* Main Content */}
        <main className='h-full overflow-auto'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
