import type { CalendarDay, CalendarEvent, LayoutEvent } from './types'

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
export function eventOverlapsRange(
  event: CalendarEvent,
  rangeStart: string,
  rangeEnd: string
): boolean {
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
export function layoutEventsForWeek(
  events: CalendarEvent[],
  weekDays: CalendarDay[]
): LayoutEvent[] {
  if (weekDays.length === 0) return []

  const weekStart = weekDays[0].dateString
  const weekEndDate = new Date(parseDateString(weekDays[6].dateString))
  weekEndDate.setDate(weekEndDate.getDate() + 1)
  const weekEnd = formatDateString(weekEndDate)

  // Filter events that overlap with this week
  const relevantEvents = events.filter((event) =>
    eventOverlapsRange(event, weekStart, weekEnd)
  )

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
        new Date(
          weekDays[i].date.getFullYear(),
          weekDays[i].date.getMonth(),
          weekDays[i].date.getDate() + 1
        )
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

