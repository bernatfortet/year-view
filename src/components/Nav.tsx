import { CalendarIcon, ChevronLeft, ChevronRight, Loader2, Plane } from 'lucide-react'
import { useStore } from '@nanostores/react'

import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { SettingsSheet } from './SettingsSheet'
import { $year } from './calendar/calendar.store'
import { $sidebarOpen, toggleSidebar } from '../stores/sidebar.store'
import { $isSyncingEvents } from '../stores/events.store'
import { $activeView, setActiveView, type ViewType } from '../stores/view.store'

export function Nav() {
  const sidebarOpen = useStore($sidebarOpen)
  const year = useStore($year)
  const isSyncing = useStore($isSyncingEvents)
  const activeView = useStore($activeView)

  return (
    <header className='z-50 grid grid-cols-3 h-12 shrink-0 items-center border-b bg-background px-4'>
      <NavLeft sidebarOpen={sidebarOpen} isSyncing={isSyncing} />
      <NavCenter year={year} activeView={activeView} />
      <NavRight />
    </header>
  )
}

function NavLeft(props: { sidebarOpen: boolean; isSyncing: boolean }) {
  const { sidebarOpen, isSyncing } = props

  return (
    <div className='flex items-center gap-4'>
      <Button variant='ghost' size='sm' onClick={toggleSidebar} className='gap-2'>
        <CalendarIcon className='size-4' />
        <span>{sidebarOpen ? 'Hide Calendars' : 'Show Calendars'}</span>
      </Button>

      <span className='text-sm font-bold text-black'>Year View Calendar</span>

      {isSyncing && <SyncingIndicator />}
    </div>
  )
}

function NavCenter(props: { year: number; activeView: ViewType }) {
  const { year, activeView } = props

  return (
    <div className='flex justify-center items-center gap-4'>
      <ViewTabs activeView={activeView} />
      <YearSelector year={year} />
    </div>
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
    <div className='flex items-center gap-2'>
      <button
        onClick={() => $year.set(year - 1)}
        className='p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors'
        aria-label='Previous year'
      >
        <ChevronLeft className='w-5 h-5' />
      </button>

      <span className='text-lg font-bold text-stone-800 min-w-16 text-center'>{year}</span>

      <button
        onClick={() => $year.set(year + 1)}
        className='p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors'
        aria-label='Next year'
      >
        <ChevronRight className='w-5 h-5' />
      </button>
    </div>
  )
}

function NavRight() {
  return (
    <div className='flex justify-end'>
      <SettingsSheet />
    </div>
  )
}

function SyncingIndicator() {
  return (
    <div className='flex items-center gap-1.5 text-xs text-stone-500 animate-in fade-in duration-300'>
      <Loader2 className='size-3 animate-spin' />
      <span>Importing...</span>
    </div>
  )
}
