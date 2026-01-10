import type { CalendarDay, CalendarEvent, LayoutEvent, TentativeInfo } from './types'

const BIRTHDAY_KEYWORDS = ['birthday', 'bday', 'aniversario', 'aniversari']

export function isBirthdayEvent(event: CalendarEvent): boolean {
  const summaryLower = event.summary.toLowerCase()

  return BIRTHDAY_KEYWORDS.some((keyword) => summaryLower.includes(keyword))
}

export function dayHasTentativeEvent(day: CalendarDay, events: CalendarEvent[]): boolean {
  const dateString = day.dateString

  const hasTentative = events.some((event) => {
    const hasQuestionMark = event.summary.includes('?')
    const intersectsDay = event.startDate <= dateString && event.endDate > dateString

    return hasQuestionMark && intersectsDay
  })

  return hasTentative
}

export function getTentativeInfoForDay(day: CalendarDay, events: CalendarEvent[]): TentativeInfo {
  const dateString = day.dateString

  const tentativeEvent = events.find((event) => {
    const hasQuestionMark = event.summary.includes('?')
    const intersectsDay = event.startDate <= dateString && event.endDate > dateString
    return hasQuestionMark && intersectsDay
  })

  if (!tentativeEvent) {
    return { hasTentative: false, isFirstDay: false, isLastDay: false }
  }

  const isFirstDay = tentativeEvent.startDate === dateString
  const lastDayString = getDateBefore(tentativeEvent.endDate)
  const isLastDay = lastDayString === dateString

  return { hasTentative: true, isFirstDay, isLastDay }
}

function getDateBefore(dateString: string): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() - 1)
  return formatDateString(date)
}

export function getBirthdayEventsForDay(day: CalendarDay, events: CalendarEvent[]): CalendarEvent[] {
  const dateString = day.dateString

  const birthdayEvents = events.filter((event) => {
    const intersectsDay = event.startDate <= dateString && event.endDate > dateString

    return isBirthdayEvent(event) && intersectsDay
  })

  return birthdayEvents
}

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Parse a YYYY-MM-DD string to a Date object (in local timezone)
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)

  return new Date(year, month - 1, day)
}

/**
 * Get the day of week (0 = Monday, 6 = Sunday) for a given date
 * This converts from JS's Sunday=0 convention to Monday=0
 */
export function getDayOfWeek(date: Date): number {
  const jsDay = date.getDay()

  return jsDay === 0 ? 6 : jsDay - 1
}

/**
 * Check if a day index is a weekend day (Saturday or Sunday)
 * Uses Monday-first convention: Saturday = 5, Sunday = 6
 */
export function isWeekendDay(dayIndex: number): boolean {
  return dayIndex === 5 || dayIndex === 6
}

/**
 * Get the number of days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Get the first day of a month
 */
export function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1)
}

/**
 * Get all days to display in a month grid (including overflow from adjacent months)
 */
export function getMonthGridDays(year: number, month: number): CalendarDay[] {
  const days: CalendarDay[] = []
  const firstDay = getFirstDayOfMonth(year, month)
  const daysInMonth = getDaysInMonth(year, month)
  const startDayOfWeek = getDayOfWeek(firstDay)

  const today = new Date()
  const todayString = formatDateString(today)

  // Add days from previous month to fill the first week
  if (startDayOfWeek > 0) {
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayOfMonth = daysInPrevMonth - i
      const date = new Date(prevYear, prevMonth, dayOfMonth)

      days.push({
        date,
        dayOfMonth,
        isCurrentMonth: false,
        isToday: formatDateString(date) === todayString,
        dateString: formatDateString(date),
      })
    }
  }

  // Add days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)

    days.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: true,
      isToday: formatDateString(date) === todayString,
      dateString: formatDateString(date),
    })
  }

  // Add days from next month to complete the grid (always fill to complete weeks)
  const remainingDays = 7 - (days.length % 7)

  if (remainingDays < 7) {
    const nextMonth = month === 11 ? 0 : month + 1
    const nextYear = month === 11 ? year + 1 : year

    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(nextYear, nextMonth, day)

      days.push({
        date,
        dayOfMonth: day,
        isCurrentMonth: false,
        isToday: formatDateString(date) === todayString,
        dateString: formatDateString(date),
      })
    }
  }

  return days
}

/**
 * Group days into weeks (arrays of 7 days each)
 */
export function groupDaysIntoWeeks(days: CalendarDay[]): CalendarDay[][] {
  const weeks: CalendarDay[][] = []

  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return weeks
}

/**
 * Check if an event overlaps with a given date range
 */
export function eventOverlapsRange(event: CalendarEvent, rangeStart: string, rangeEnd: string): boolean {
  // Event end date is exclusive in Google Calendar
  return event.startDate < rangeEnd && event.endDate > rangeStart
}

/**
 * Get the duration of an event in days
 */
export function getEventDuration(event: CalendarEvent): number {
  const start = parseDateString(event.startDate)
  const end = parseDateString(event.endDate)
  const diffTime = end.getTime() - start.getTime()

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calculate layout positions for events within a week
 * Uses a packing algorithm similar to Google Calendar:
 * - Longer events are placed first (at the top)
 * - Events are assigned to rows to avoid overlaps
 * - Events are clipped to only show on current month days (not ghost days)
 */
export function layoutEventsForWeek(events: CalendarEvent[], weekDays: CalendarDay[]): LayoutEvent[] {
  if (weekDays.length === 0) return []

  const weekStart = weekDays[0].dateString
  const weekEndDate = new Date(parseDateString(weekDays[6].dateString))
  weekEndDate.setDate(weekEndDate.getDate() + 1)
  const weekEnd = formatDateString(weekEndDate)

  // Filter events that overlap with this week
  const relevantEvents = events.filter((event) => eventOverlapsRange(event, weekStart, weekEnd))

  // Sort by duration (longest first), then by start date
  const sortedEvents = [...relevantEvents].sort((a, b) => {
    const durationA = getEventDuration(a)
    const durationB = getEventDuration(b)

    if (durationB !== durationA) {
      return durationB - durationA // Longest first
    }

    return a.startDate.localeCompare(b.startDate)
  })

  // Track which rows are occupied for each day of the week
  // rowOccupancy[row][dayIndex] = true if occupied
  const rowOccupancy: boolean[][] = []

  const layoutEvents: LayoutEvent[] = []

  for (const event of sortedEvents) {
    // Calculate which days of this week the event spans
    const eventStart = parseDateString(event.startDate)
    const eventEnd = parseDateString(event.endDate)

    // Find the visible start and end within this week
    let startColumn = 0
    let endColumn = 6

    for (let i = 0; i < 7; i++) {
      const dayDate = weekDays[i].date

      if (dayDate >= eventStart && startColumn === 0 && i > 0) {
        startColumn = i
      }

      if (formatDateString(dayDate) === event.startDate) {
        startColumn = i
      }
    }

    // Find where the event ends in this week
    for (let i = 6; i >= 0; i--) {
      const dayDate = weekDays[i].date
      const nextDay = new Date(dayDate)
      nextDay.setDate(nextDay.getDate() + 1)

      if (nextDay <= eventEnd) {
        endColumn = i
        break
      }

      if (dayDate < eventEnd) {
        endColumn = i
        break
      }
    }

    // Recalculate startColumn properly
    for (let i = 0; i < 7; i++) {
      if (weekDays[i].dateString >= event.startDate) {
        startColumn = i
        break
      }

      if (i === 6) {
        startColumn = 0
      }
    }

    if (event.startDate < weekStart) {
      startColumn = 0
    }

    // Recalculate endColumn properly
    for (let i = 6; i >= 0; i--) {
      const nextDayString = formatDateString(
        new Date(weekDays[i].date.getFullYear(), weekDays[i].date.getMonth(), weekDays[i].date.getDate() + 1),
      )

      if (nextDayString <= event.endDate) {
        endColumn = i
        break
      }
    }

    // Clip to only current month days (skip ghost days)
    while (startColumn <= endColumn && !weekDays[startColumn].isCurrentMonth) {
      startColumn++
    }

    while (endColumn >= startColumn && !weekDays[endColumn].isCurrentMonth) {
      endColumn--
    }

    // Skip if event only spans ghost days
    if (startColumn > endColumn) continue

    const spanDays = endColumn - startColumn + 1

    // Find the first available row
    let assignedRow = 0
    let foundRow = false

    while (!foundRow) {
      if (!rowOccupancy[assignedRow]) {
        rowOccupancy[assignedRow] = new Array(7).fill(false)
      }

      // Check if this row is free for all days the event spans
      let rowIsFree = true

      for (let day = startColumn; day <= endColumn; day++) {
        if (rowOccupancy[assignedRow][day]) {
          rowIsFree = false
          break
        }
      }

      if (rowIsFree) {
        foundRow = true

        // Mark the row as occupied for these days
        for (let day = startColumn; day <= endColumn; day++) {
          rowOccupancy[assignedRow][day] = true
        }
      } else {
        assignedRow++
      }
    }

    layoutEvents.push({
      ...event,
      row: assignedRow,
      startColumn,
      spanDays,
      continuesFromPrevious: event.startDate < weekStart,
      continuesAfter: event.endDate > weekEnd,
    })
  }

  return layoutEvents
}

/**
 * Get month name from month index (0-11)
 */
export function getMonthName(month: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return months[month]
}

/**
 * Get short day names starting from Monday
 */
export function getWeekDayNames(): string[] {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
}

// --- Trip Detection & Flight Info ---

export type TripType = 'flight' | 'car' | null

export interface MinimalFlightInfo {
  departureCode: string
  departureTime: string
  arrivalCode: string
  arrivalTime: string
}

export interface TripInfo {
  isTrip: boolean
  tripType: TripType
  returnFlight: MinimalFlightInfo | null
}

/**
 * Detect if an event is a trip and extract trip info
 */
export function getTripInfo(event: { summary: string; description?: string }): TripInfo {
  const summaryLower = event.summary.toLowerCase()
  const isTrip = summaryLower.includes('trip')

  if (!isTrip) {
    return { isTrip: false, tripType: null, returnFlight: null }
  }

  const tripType = detectTripType(event.description)
  const returnFlight = tripType === 'flight' ? parseReturnFlightInfo(event.description) : null

  return { isTrip: true, tripType, returnFlight }
}

/**
 * Detect if a trip is by flight or car based on description
 */
function detectTripType(description?: string): TripType {
  if (!description) return null

  const descLower = description.toLowerCase()

  // Check for flight indicators
  const hasFlightKeywords =
    descLower.includes('flight:') ||
    descLower.includes('departure:') ||
    descLower.includes('arrival:') ||
    /\b[A-Z]{2}\s*\d{3,4}\b/.test(description) // Airline code + flight number

  if (hasFlightKeywords) return 'flight'

  // Check for car/drive indicators
  const hasCarKeywords = descLower.includes('drive') || descLower.includes('driving') || descLower.includes('road trip')

  if (hasCarKeywords) return 'car'

  return null
}

/**
 * Parse minimal return flight info from description
 * Returns first return flight leg info like: SFO 4:30pm → SJO 9:45pm
 */
function parseReturnFlightInfo(description?: string): MinimalFlightInfo | null {
  if (!description) return null

  // Look for the return section
  const returnMatch = description.match(/return:\s*\n?([\s\S]*?)(?=\n\n|$)/i)
  if (!returnMatch) return null

  const returnSection = returnMatch[1]

  // Parse the first flight in return section
  const departureMatch = returnSection.match(/departure:\s*(?:.*?\s)?([A-Z]{3})\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i)
  const arrivalMatch = returnSection.match(/arrival:\s*(?:.*?\s)?([A-Z]{3})\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i)

  if (!departureMatch || !arrivalMatch) return null

  return {
    departureCode: departureMatch[1].toUpperCase(),
    departureTime: departureMatch[2].toLowerCase().replace(/\s+/g, ''),
    arrivalCode: arrivalMatch[1].toUpperCase(),
    arrivalTime: arrivalMatch[2].toLowerCase().replace(/\s+/g, ''),
  }
}

/**
 * Format minimal flight info for display: "SFO 4:30pm → AUS 9:45pm"
 */
export function formatMinimalFlightInfo(flight: MinimalFlightInfo): string {
  return `${flight.departureCode} ${flight.departureTime} → ${flight.arrivalCode} ${flight.arrivalTime}`
}

/**
 * Get all weeks of a year as continuous CalendarDay[][] arrays
 * Each week starts on Monday and ends on Sunday
 */
export function getYearWeeks(year: number): CalendarDay[][] {
  const weeks: CalendarDay[][] = []

  // Find the first Monday of the year (or the Monday before Jan 1)
  const jan1 = new Date(year, 0, 1)
  const jan1DayOfWeek = getDayOfWeek(jan1)

  // Start from the Monday of the week containing Jan 1
  const startDate = new Date(year, 0, 1 - jan1DayOfWeek)

  // Find the last day we need to include (Dec 31 or the Sunday after)
  const dec31 = new Date(year, 11, 31)
  const dec31DayOfWeek = getDayOfWeek(dec31)
  const endDate = new Date(year, 11, 31 + (6 - dec31DayOfWeek))

  const today = new Date()
  const todayString = formatDateString(today)

  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const week: CalendarDay[] = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate)
      const dateString = formatDateString(date)
      const isCurrentYear = date.getFullYear() === year

      week.push({
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: isCurrentYear,
        isToday: dateString === todayString,
        dateString,
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    weeks.push(week)
  }

  return weeks
}
