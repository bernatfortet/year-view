import { useMemo } from 'react'

import { formatDateString, parseDateString, getDayOfWeek } from '../calendar/utils'

type TripStatus = 'todo' | 'pending' | 'has-info'

interface TripMinimapProps {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD (exclusive)
  tripStatus?: TripStatus
}

interface MinimapDay {
  dateString: string
  isInTrip: boolean
  isToday: boolean
}

const MAX_WEEKS = 5
const CELL_SIZE = 8

export function TripMinimap(props: TripMinimapProps) {
  const { startDate, endDate, tripStatus } = props

  const weeks = useMemo(() => {
    return generateMinimapWeeks({ startDate, endDate })
  }, [startDate, endDate])

  const fillColor =
    tripStatus === 'todo'
      ? 'rgba(250, 204, 21, 0.4)' // yellow for needs planning
      : tripStatus === 'pending'
        ? 'rgba(114, 47, 55, 0.6)' // brand-red 60% for needs info
        : 'rgba(114, 47, 55, 0.8)' // brand-red 80% for has-info

  return (
    <div
      className='grid shrink-0 ring-[0.5px]  ring-black/10'
      style={{
        gridTemplateColumns: `repeat(7, ${CELL_SIZE}px)`,
      }}
    >
      {weeks.map((week, weekIndex) => (
        <WeekRow key={weekIndex} week={week} fillColor={fillColor} />
      ))}
    </div>
  )
}

function WeekRow(props: { week: MinimapDay[]; fillColor: string }) {
  const { week, fillColor } = props

  return (
    <>
      {week.map((day) => (
        <DayCell key={day.dateString} day={day} fillColor={fillColor} />
      ))}
    </>
  )
}

function DayCell(props: { day: MinimapDay; fillColor: string }) {
  const { day, fillColor } = props

  if (day.isInTrip) {
    return (
      <div
        className='relative  ring-[0.5px] ring-inset ring-black/10'
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          backgroundColor: fillColor,
        }}
      >
        {day.isToday && <TodayDot />}
      </div>
    )
  }

  return (
    <div
      className='relative ring-[0.5px] ring-inset ring-black/10 '
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
      }}
    >
      {day.isToday && <TodayDot />}
    </div>
  )
}

function TodayDot() {
  return (
    <div
      className='absolute bg-brand-red rounded-full'
      style={{
        width: 3,
        height: 3,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    />
  )
}

/**
 * Generates weeks of MinimapDay for display.
 * Prioritizes showing all trip weeks, with limited context.
 */
function generateMinimapWeeks(params: { startDate: string; endDate: string }): MinimapDay[][] {
  const { startDate, endDate } = params

  const tripStart = parseDateString(startDate)
  const tripEnd = parseDateString(endDate)

  // Get today for comparison
  const today = new Date()
  const todayString = formatDateString(today)

  // Start from the Monday of the week containing trip start
  const tripWeekStart = getWeekStart(tripStart)

  // End at the Sunday of the week containing trip end (exclusive, so -1 day)
  const lastTripDay = addDays(tripEnd, -1)
  const tripWeekEnd = getWeekEnd(lastTripDay)

  // Calculate how many weeks the trip spans
  const tripWeekCount = Math.ceil((tripWeekEnd.getTime() - tripWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1

  // Determine how much context we can show (prefer 1 week each side, but reduce if trip is long)
  const availableContextWeeks = Math.max(0, MAX_WEEKS - tripWeekCount)
  const contextBefore = Math.min(1, Math.floor(availableContextWeeks / 2))
  const contextAfter = Math.min(1, availableContextWeeks - contextBefore)

  // Calculate final display range
  const displayStart = addDays(tripWeekStart, -contextBefore * 7)
  const displayEnd = addDays(tripWeekEnd, contextAfter * 7)

  // Generate all days in range
  const allDays: MinimapDay[] = []
  const currentDate = new Date(displayStart)

  while (currentDate <= displayEnd) {
    const dateString = formatDateString(currentDate)

    allDays.push({
      dateString,
      isInTrip: dateString >= startDate && dateString < endDate,
      isToday: dateString === todayString,
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Group into weeks
  const weeks: MinimapDay[][] = []

  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  return weeks
}

/**
 * Gets the Monday of the week containing the given date.
 */
function getWeekStart(date: Date): Date {
  const dayOfWeek = getDayOfWeek(date)
  const monday = new Date(date)
  monday.setDate(date.getDate() - dayOfWeek)

  return monday
}

/**
 * Gets the Sunday of the week containing the given date.
 */
function getWeekEnd(date: Date): Date {
  const dayOfWeek = getDayOfWeek(date)
  const sunday = new Date(date)
  sunday.setDate(date.getDate() + (6 - dayOfWeek))

  return sunday
}

/**
 * Adds days to a date.
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)

  return result
}
