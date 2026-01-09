import { CalendarIcon, ChevronLeft, ChevronRight, Grid3x3Icon, Loader2, Plane, RefreshCw } from 'lucide-react'
import { useStore } from '@nanostores/react'

import { Row } from '@/styles'
import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { SettingsSheet } from './SettingsSheet'
import { MagicBehaviors } from './calendar/MagicBehaviors'
import { $year } from './calendar/calendar.store'
import { $sidebarOpen, toggleSidebar } from '../stores/sidebar.store'
import { $isSyncingEvents, triggerEventsRefresh } from '../stores/events.store'
import { $activeView, setActiveView, type ViewType } from '../stores/view.store'
import { useCalendars } from '../context/CalendarContext'

export function Nav() {
  const sidebarOpen = useStore($sidebarOpen)
  const year = useStore($year)
  const isSyncing = useStore($isSyncingEvents)
  const activeView = useStore($activeView)

  return (
    <header className='z-40 grid grid-cols-3 h-12 shrink-0 items-center dark border-b bg-brand-red text-white px-4'>
      <NavLeft activeView={activeView} />
      <NavCenter year={year} />
      <NavRight sidebarOpen={sidebarOpen} isSyncing={isSyncing} />
    </header>
  )
}

function NavLeft(props: { activeView: ViewType }) {
  const { activeView } = props

  return (
    <Row className='items-center gap-6'>
      <span className='text-[24px] text-white' style={{ fontFamily: "'Instrument Serif', serif" }}>
        Year<span className='italic'>Trips</span>
        <span className='text-brand-blue'>.</span>com
      </span>

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

function NavRight(props: { sidebarOpen: boolean; isSyncing: boolean }) {
  const { sidebarOpen, isSyncing } = props
  const { refreshCalendars, isLoadingCalendars } = useCalendars()

  function handleSync() {
    refreshCalendars()
    triggerEventsRefresh()
  }

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
        className='p-1.5 cursor-pointer rounded-lg text-white hover:text-white hover:bg-white/20 transition-colors'
        aria-label='Previous year'
      >
        <ChevronLeft className='w-5 h-5' />
      </button>

      <span className='text-lg font-bold  min-w-16 text-center'>{year}</span>

      <button
        onClick={() => $year.set(year + 1)}
        className='p-1.5 cursor-pointer rounded-lg text-white hover:text-white hover:bg-white/20 transition-colors'
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
