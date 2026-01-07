import { CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useStore } from '@nanostores/react'

import { Button } from './ui/button'
import { SettingsSheet } from './SettingsSheet'
import { $year } from './calendar/calendar.store'
import { $sidebarOpen, toggleSidebar } from '../stores/sidebar.store'
import { $isSyncingEvents } from '../stores/events.store'

export function Nav() {
  const sidebarOpen = useStore($sidebarOpen)
  const year = useStore($year)
  const isSyncing = useStore($isSyncingEvents)

  return (
    <header className='z-50 grid grid-cols-3 h-12 shrink-0 items-center border-b bg-background px-4'>
      <NavLeft sidebarOpen={sidebarOpen} isSyncing={isSyncing} />
      <NavCenter year={year} />
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

function NavCenter(props: { year: number }) {
  const { year } = props

  return (
    <div className='flex justify-center'>
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

