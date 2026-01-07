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
 * - 'todo': Has "?" in the title (needs planning)
 * - 'has-info': Has a non-empty description (has flight/travel info)
 * - 'pending': Confirmed trip but no details yet
 */
function determineTripStatus(event: CalendarEvent): TripStatus {
  if (event.summary.includes('?')) return 'todo'
  if (event.description && event.description.trim().length > 0) return 'has-info'

  return 'pending'
}

/**
 * Checks if a trip has already ended
 */
function checkIfPast(event: CalendarEvent, today: Date): boolean {
  const endDate = new Date(event.endDate)
  const isPast = endDate < today

  return isPast
}

/**
 * Formats a trip's date range for display
 */
export function formatTripDateRange(trip: Trip): string {
  const start = new Date(trip.startDate)
  const end = new Date(trip.endDate)

  // Google Calendar uses exclusive end dates, so subtract one day for display
  end.setDate(end.getDate() - 1)

  const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }

  const startFormatted = start.toLocaleDateString('en-US', formatOptions)
  const endFormatted = end.toLocaleDateString('en-US', formatOptions)

  // If same day, just show one date
  if (start.getTime() === end.getTime()) return startFormatted

  // If same month, show "Jan 15 - 22"
  if (start.getMonth() === end.getMonth()) {
    return `${startFormatted} - ${end.getDate()}`
  }

  // Different months, show full range
  return `${startFormatted} - ${endFormatted}`
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

