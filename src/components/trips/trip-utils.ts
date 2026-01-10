import type { CalendarEvent } from '../calendar/types'

export type TripStatus = 'todo' | 'has-info' | 'pending'

export interface Trip extends CalendarEvent {
  tripStatus: TripStatus
  isPast: boolean
}

/**
 * Filters events to only include trips (events with "trip" in the title)
 * and enriches them with status information.
 */
export function filterAndEnrichTrips(events: CalendarEvent[]): Trip[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const trips = events
    .filter((event) => isTripEvent(event))
    .map((event) => enrichTripWithStatus(event, today))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))

  return trips
}

/**
 * Determines if an event is a trip based on its title
 */
function isTripEvent(event: CalendarEvent): boolean {
  const summaryLower = event.summary.toLowerCase()
  const isTrip = summaryLower.includes('trip')

  return isTrip
}

/**
 * Enriches a trip event with status and temporal information
 */
function enrichTripWithStatus(event: CalendarEvent, today: Date): Trip {
  const tripStatus = determineTripStatus(event)
  const isPast = checkIfPast(event, today)

  return {
    ...event,
    tripStatus,
    isPast,
  }
}

/**
 * Determines the status of a trip based on its title and description
 * - 'has-info': Has a non-empty description (has flight/travel info) - takes priority
 * - 'todo': Has "?" in the title (needs planning) but no description
 * - 'pending': Confirmed trip but no details yet
 */
function determineTripStatus(event: CalendarEvent): TripStatus {
  const hasQuestion = event.summary.includes('?')
  const hasDescription = event.description && event.description.trim().length > 0
  let status: TripStatus = 'pending'

  // Description takes priority - if we have flight info, show it regardless of "?"
  if (hasDescription) status = 'has-info'
  else if (hasQuestion) status = 'todo'

  return status
}

/**
 * Checks if a trip has already ended
 */
function checkIfPast(event: CalendarEvent, today: Date): boolean {
  const endDate = parseDateString(event.endDate)
  const isPast = endDate < today

  return isPast
}

/**
 * Formats a trip's date range for display with weekday names
 * e.g., "Sun Feb 15 - Sun 22" or "Fri Feb 14 - Sun Mar 2"
 */
export function formatTripDateRange(trip: Trip): string {
  const start = parseDateString(trip.startDate)
  const end = parseDateString(trip.endDate)

  // Google Calendar uses exclusive end dates, so subtract one day for display
  end.setDate(end.getDate() - 1)

  const fullFormat: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }
  const weekdayOnly: Intl.DateTimeFormatOptions = { weekday: 'short' }

  const startFormatted = start.toLocaleDateString('en-US', fullFormat)
  const endFormatted = end.toLocaleDateString('en-US', fullFormat)
  const endWeekday = end.toLocaleDateString('en-US', weekdayOnly)

  // If same day, just show one date
  if (start.getTime() === end.getTime()) return startFormatted

  // If same month, show "Sun Feb 15 - Sun 22"
  if (start.getMonth() === end.getMonth()) {
    return `${startFormatted} - ${endWeekday} ${end.getDate()}`
  }

  // Different months, show full range "Fri Feb 14 - Sun Mar 2"
  return `${startFormatted} - ${endFormatted}`
}

/**
 * Parses a date string (YYYY-MM-DD) as local date, not UTC.
 * This avoids timezone issues where "2026-02-15" becomes Feb 14 in US timezones.
 */
function parseDateString(dateString: string): Date {
  // If it's a date-only string (YYYY-MM-DD), parse as local
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  // Otherwise use standard parsing (for datetime strings)
  return new Date(dateString)
}

/**
 * Gets the display name for a trip.
 * Removes "trip" prefix, adds single trailing "?" for todo trips to show uncertainty.
 */
export function getTripDisplayName(trip: Trip): string {
  const displayName = trip.summary
    .replace(/trip/gi, '')
    .replace(/\?/g, '')
    .replace(/[-–—:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Add single trailing "?" for todos to indicate uncertainty
  if (trip.tripStatus === 'todo') {
    return (displayName || 'Unnamed Trip') + '?'
  }

  return displayName || 'Unnamed Trip'
}
