import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { useStore } from '@nanostores/react'

import { AuthProvider, useAuth } from '../context/AuthContext'
import { CalendarProvider } from '../context/CalendarContext'
import { CalendarSidebar } from '../components/CalendarSidebar'
import { GrainBackground } from '../components/GrainOverlay'
import { Nav } from '../components/Nav'
import { $sidebarOpen, toggleSidebar } from '../stores/sidebar.store'
import appCss from '../styles.css?url'

const APP_URL = 'https://yeartrips.com'
const APP_TITLE = 'YearTrips - Year View Calendar'
const APP_DESCRIPTION =
  'See your whole year at a glance. Organize trips, vacations, school calendar, and events in a beautiful year view.'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: APP_TITLE },
      { name: 'description', content: APP_DESCRIPTION },
      { name: 'theme-color', content: '#22c55e' },
      { name: 'application-name', content: 'YearTrips' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: 'YearTrips' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: APP_URL },
      { property: 'og:title', content: APP_TITLE },
      { property: 'og:description', content: APP_DESCRIPTION },
      { property: 'og:image', content: `${APP_URL}/og-image.png` },
      { property: 'og:site_name', content: 'YearTrips' },
      // Twitter
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:url', content: APP_URL },
      { name: 'twitter:title', content: APP_TITLE },
      { name: 'twitter:description', content: APP_DESCRIPTION },
      { name: 'twitter:image', content: `${APP_URL}/og-image.png` },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;900&display=swap',
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
  const { isAuthenticated, isLoading } = useAuth()

  const showAppChrome = isAuthenticated && !isLoading

  return (
    <div className={`flex h-screen flex-col ${showAppChrome ? 'bg-background-app' : ''}`}>
      {showAppChrome && <Nav />}

      {/* Content area with floating sidebar */}
      <div className='relative flex-1 overflow-hidden'>
        {/* Floating Sidebar */}
        {showAppChrome && sidebarOpen && (
          <>
            {/* Backdrop */}
            <div className='absolute inset-0 z-30 bg-black/20' onClick={toggleSidebar} />

            {/* Sidebar Panel - Right side */}
            <div className='absolute right-0 top-0 z-40 h-full w-72 border-l bg-background shadow-lg'>
              <CalendarSidebar />
            </div>
          </>
        )}

        {/* Main Content - grain scrolls with content */}
        <main className='h-full overflow-auto'>
          {showAppChrome ? (
            <GrainBackground className='min-h-full'>
              <Outlet />
            </GrainBackground>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  )
}
