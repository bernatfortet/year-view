import { CalendarIcon, ChevronLeft, ChevronRight, Grid3x3Icon, Loader2, LogOut, Plane, RefreshCw } from 'lucide-react'
import { useStore } from '@nanostores/react'
import { Link } from '@tanstack/react-router'

import { Row } from '@/styles'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { SettingsSheet } from './SettingsSheet'
import { MagicBehaviors } from './calendar/MagicBehaviors'
import { $year } from './calendar/calendar.store'
import { $sidebarOpen, toggleSidebar } from '../stores/sidebar.store'
import { $isSyncingEvents, triggerEventsRefresh } from '../stores/events.store'
import { $activeView, setActiveView, type ViewType } from '../stores/view.store'
import { useCalendars } from '../context/CalendarContext'
import { useDemoMode } from '../context/DemoContext'
import { useAuth } from '../context/AuthContext'

export function Nav() {
  const sidebarOpen = useStore($sidebarOpen)
  const year = useStore($year)
  const isSyncing = useStore($isSyncingEvents)
  const activeView = useStore($activeView)
  const isDemoMode = useDemoMode()

  return (
    <header className='z-40 grid grid-cols-3 h-12 shrink-0 items-center dark border-b bg-brand-red text-white px-4'>
      <NavLeft activeView={activeView} isDemoMode={isDemoMode} />
      <NavCenter year={year} />
      <NavRight sidebarOpen={sidebarOpen} isSyncing={isSyncing} isDemoMode={isDemoMode} />
    </header>
  )
}

function NavLeft(props: { activeView: ViewType; isDemoMode: boolean }) {
  const { activeView, isDemoMode } = props

  return (
    <Row className='items-center gap-6'>
      <Row className='items-center gap-2'>
        <span className='text-[24px] text-white' style={{ fontFamily: "'Instrument Serif', serif" }}>
          Year<span className='italic'>Trips</span>
          <span className='text-brand-blue'>.</span>com
        </span>

        {isDemoMode && (
          <Badge variant='secondary' className='text-xs bg-white/20 text-white hover:bg-white/20'>
            Demo
          </Badge>
        )}
      </Row>

      <ViewTabs activeView={activeView} />
      <MagicBehaviors />
    </Row>
  )
}

function NavCenter(props: { year: number }) {
  const { year } = props

  return (
    <Row className='justify-center'>
      <YearSelector year={year} />
    </Row>
  )
}

function NavRight(props: { sidebarOpen: boolean; isSyncing: boolean; isDemoMode: boolean }) {
  const { sidebarOpen, isSyncing, isDemoMode } = props
  const { refreshCalendars, isLoadingCalendars } = useCalendars()
  const { signIn } = useAuth()

  function handleSync() {
    refreshCalendars()
    triggerEventsRefresh()
  }

  // Demo mode: show sign in and exit demo buttons
  if (isDemoMode) {
    return (
      <Row className='items-center justify-end gap-2'>
        <Button variant='ghost' size='sm' onClick={toggleSidebar} className='gap-2'>
          <CalendarIcon className='size-4' />
          <span>{sidebarOpen ? 'Hide Calendars' : 'Show Calendars'}</span>
        </Button>

        <SettingsSheet />

        <Button onClick={signIn} size='sm' className='gap-2 bg-white text-gray-800 hover:bg-white/90'>
          <GoogleIcon />
          <span>Sign in with Google</span>
        </Button>

        <Link to='/'>
          <Button variant='ghost' size='sm' className='gap-2'>
            <LogOut className='size-4' />
            <span>Exit Demo</span>
          </Button>
        </Link>
      </Row>
    )
  }

  // Authenticated mode: show sync and calendar controls
  return (
    <Row className='items-center justify-end gap-1'>
      {isSyncing && <SyncingIndicator />}

      <Button variant='ghost' size='icon' onClick={handleSync} disabled={isSyncing || isLoadingCalendars} title='Sync calendars'>
        <RefreshCw className={isSyncing || isLoadingCalendars ? 'size-4 animate-spin' : 'size-4'} />
      </Button>

      <Button variant='ghost' size='sm' onClick={toggleSidebar} className='gap-2'>
        <CalendarIcon className='size-4' />
        <span>{sidebarOpen ? 'Hide Calendars' : 'Show Calendars'}</span>
      </Button>

      <SettingsSheet />
    </Row>
  )
}

function ViewTabs(props: { activeView: ViewType }) {
  const { activeView } = props

  return (
    <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ViewType)}>
      <TabsList>
        <TabsTrigger value='year' className='gap-1.5'>
          <CalendarIcon className='size-3.5' />
          Year
        </TabsTrigger>
        <TabsTrigger value='linear' className='gap-1.5'>
          <Grid3x3Icon className='size-3.5' />
          Linear
        </TabsTrigger>
        <TabsTrigger value='trips' className='gap-1.5'>
          <Plane className='size-3.5' />
          Trips
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

function YearSelector(props: { year: number }) {
  const { year } = props

  return (
    <Row className='items-center gap-2'>
      <button
        onClick={() => $year.set(year - 1)}
        className='p-1.5 cursor-pointer rounded-lg text-white/40 hover:text-white hover:bg-white/20 transition-colors'
        aria-label='Previous year'
      >
        <ChevronLeft className='w-5 h-5' />
      </button>

      <span className='text-lg font-bold  min-w-16 text-center'>{year}</span>

      <button
        onClick={() => $year.set(year + 1)}
        className='p-1.5 cursor-pointer rounded-lg text-white/40 hover:text-white hover:bg-white/20 transition-colors'
        aria-label='Next year'
      >
        <ChevronRight className='w-5 h-5' />
      </button>
    </Row>
  )
}

function SyncingIndicator() {
  return (
    <Row className='items-center gap-1.5 text-xs text-stone-500 animate-in fade-in duration-300'>
      <Loader2 className='size-3 animate-spin' />
      <span>Importing...</span>
    </Row>
  )
}

function GoogleIcon() {
  return (
    <svg className='w-4 h-4' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
        fill='#4285F4'
      />
      <path
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
        fill='#34A853'
      />
      <path
        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
        fill='#FBBC05'
      />
      <path
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
        fill='#EA4335'
      />
    </svg>
  )
}
