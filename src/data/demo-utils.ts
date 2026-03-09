import type { CalendarEvent } from '@/components/calendar/types'

import { demoEvents } from './demo-data'

type FilterDemoEventsParams = {
  year: number
  selectedCalendarIds: string[]
  excludeTerms: string[]
}

export function getDemoEventsForYear(year: number): CalendarEvent[] {
  const result = shiftEventsToYear({ events: demoEvents, year })
  return result
}

export function filterDemoEvents(params: FilterDemoEventsParams): CalendarEvent[] {
  const { year, selectedCalendarIds, excludeTerms } = params
  const selectedSet = new Set(selectedCalendarIds)
  const shiftedEvents = getDemoEventsForYear(year)
  const calendarFiltered = shiftedEvents.filter((event) => selectedSet.has(event.calendarId))

  if (excludeTerms.length === 0) return calendarFiltered

  const result = calendarFiltered.filter((event) => {
    const summaryLower = event.summary.toLowerCase()
    const matchesExcludeTerm = excludeTerms.some((term) => summaryLower.includes(term.toLowerCase()))
    return !matchesExcludeTerm
  })

  return result
}

export function shiftEventsToYear(params: { events: CalendarEvent[]; year: number }): CalendarEvent[] {
  const { events, year } = params
  const baseYear = getBaseYear(events)
  const yearOffset = year - baseYear

  if (yearOffset === 0) return events

  const result = events.map((event) => ({
    ...event,
    id: `${event.id}-${year}`,
    startDate: shiftIsoDateByYears({ dateString: event.startDate, yearOffset }),
    endDate: shiftIsoDateByYears({ dateString: event.endDate, yearOffset }),
  }))

  return result
}

export function getPreviewYearFromDemoEvents(events: CalendarEvent[]): number {
  const result = getBaseYear(events)
  return result
}

function getBaseYear(events: CalendarEvent[]): number {
  const earliestStartDate = events.reduce<string | null>((currentEarliest, event) => {
    if (!currentEarliest || event.startDate < currentEarliest) return event.startDate
    return currentEarliest
  }, null)

  if (!earliestStartDate) return new Date().getFullYear()

  const startYear = Number.parseInt(earliestStartDate.slice(0, 4), 10)
  if (Number.isNaN(startYear)) return new Date().getFullYear()

  return startYear
}

function shiftIsoDateByYears(params: { dateString: string; yearOffset: number }): string {
  const { dateString, yearOffset } = params
  const [year, month, day] = dateString.split('-').map((value) => Number.parseInt(value, 10))
  const shiftedDate = new Date(year, month - 1, day)

  shiftedDate.setFullYear(shiftedDate.getFullYear() + yearOffset)

  const result = formatIsoDate(shiftedDate)
  return result
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const result = `${year}-${month}-${day}`
  return result
}
