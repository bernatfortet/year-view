import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import { Plane, Car } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Row } from '@/styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { CalendarDay, CalendarEvent, TentativeInfo, YearViewProps } from './types'
import { EVENT_COLORS } from './types'
import { DayCell } from './DayCell'
import { WeekdayHeader } from './WeekdayHeader'
import { $isSyncingEvents } from '@/stores/events.store'
import {
  formatDateString,
  formatMinimalFlightInfo,
  getDayOfWeek,
  getMonthName,
  getTripInfo,
  isBirthdayEvent,
  isVisitEvent,
  parseDateString,
} from './utils'
import { TripPopoverContent } from './TripPopoverContent'
import { getTripFromEvent } from '../trips/trip-utils'

const MIN_CELL_SIZE = 60

export function LinearYearView({ year, events }: YearViewProps) {
  const isSyncing = useStore($isSyncingEvents)
  const containerRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(7)
  const [cellSize, setCellSize] = useState(MIN_CELL_SIZE)

  // Memoize days array - only recalculate when year changes
  const days = useMemo(() => getYearDays(year), [year])

  // Calculate padding days needed at the start (to align weekends)
  const paddingDaysStart = useMemo(() => {
    const jan1 = new Date(year, 0, 1)
    return getDayOfWeek(jan1)
  }, [year])

  // Calculate padding days needed at the end (to complete the last row)
  const paddingDaysEnd = useMemo(() => {
    const totalCells = paddingDaysStart + days.length
    const remainder = totalCells % columns
    return remainder === 0 ? 0 : columns - remainder
  }, [paddingDaysStart, days.length, columns])

  // Pre-compute event lookups - O(1) per day instead of O(events) per day
  const { tentativeByDate, birthdaysByDate } = useMemo(() => {
    return buildEventLookupMaps(events)
  }, [events])

  useEffect(() => {
    function calculateColumns() {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.offsetWidth
      const maxColumns = Math.floor(containerWidth / MIN_CELL_SIZE)

      // Round down to nearest multiple of 7
      const columnsMultipleOf7 = Math.max(7, Math.floor(maxColumns / 7) * 7)
      setColumns(columnsMultipleOf7)

      // Calculate actual cell size based on container width
      const actualCellSize = Math.floor(containerWidth / columnsMultipleOf7)
      setCellSize(actualCellSize)
    }

    calculateColumns()

    const resizeObserver = new ResizeObserver(calculateColumns)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [])

  // Calculate event bar segments for CSS grid positioning
  const eventSegments = useMemo(
    () => calculateEventSegments({ events, days, paddingDays: paddingDaysStart, columns, year }),
    [events, days, paddingDaysStart, columns, year],
  )

  return (
    <div ref={containerRef} className='min-h-screen'>
      {/* Sync indicator */}
      {isSyncing && (
        <Row className='fixed top-16 right-8 items-center gap-1.5 text-xs text-tertiary z-20'>
          <div className='w-2.5 h-2.5 border-2 border-tertiary border-t-transparent rounded-full animate-spin' />
          <span>Syncing</span>
        </Row>
      )}

      <WeekdayHeader variant='linear-view' columns={columns} />

      {/* Grid container with days and events */}
      <div className='relative'>
        {/* Day cells grid */}
        <div
          className='grid border-t border-l border-stone-200'
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridAutoRows: `${cellSize}px`,
          }}
        >
          {/* Padding cells at start - previous year days */}
          {Array.from({ length: paddingDaysStart }).map((_, index) => (
            <PaddingCell key={`padding-start-${index}`} />
          ))}

          {/* Actual days */}
          {days.map((day) => (
            <LinearDayCell
              key={day.dateString}
              day={day}
              cellSize={cellSize}
              isFirstOfMonth={day.isFirstOfMonth}
              tentativeInfo={tentativeByDate[day.dateString] ?? DEFAULT_TENTATIVE}
              birthdayEvents={birthdaysByDate[day.dateString] ?? []}
            />
          ))}

          {/* Padding cells at end - next year days */}
          {Array.from({ length: paddingDaysEnd }).map((_, index) => (
            <PaddingCell key={`padding-end-${index}`} />
          ))}
        </div>

        {/* Event bars overlay - absolutely positioned */}
        {eventSegments.map((segment, index) => (
          <EventBarSegment key={`${segment.event.id}-${index}`} segment={segment} cellSize={cellSize} />
        ))}
      </div>
    </div>
  )
}

type DayInfo = {
  date: Date
  dayOfMonth: number
  month: number
  isToday: boolean
  dateString: string
  isFirstOfMonth: boolean
}

function getYearDays(year: number): DayInfo[] {
  const days: DayInfo[] = []
  const today = new Date()
  const todayString = formatDateString(today)

  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dateString = formatDateString(currentDate)

    days.push({
      date: new Date(currentDate),
      dayOfMonth: currentDate.getDate(),
      month: currentDate.getMonth(),
      isToday: dateString === todayString,
      dateString,
      isFirstOfMonth: currentDate.getDate() === 1,
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return days
}

type EventLookupMaps = {
  tentativeByDate: Record<string, TentativeInfo>
  birthdaysByDate: Record<string, CalendarEvent[]>
}

const DEFAULT_TENTATIVE: TentativeInfo = { hasTentative: false, hasTrip: false, hasVisit: false, isFirstDay: false, isLastDay: false }

function getEventColor(event: CalendarEvent): string {
  return event.colorId
    ? EVENT_COLORS[event.colorId] || EVENT_COLORS.default
    : event.backgroundColor || EVENT_COLORS.default
}

function buildEventLookupMaps(events: CalendarEvent[]): EventLookupMaps {
  const tentativeByDate: Record<string, TentativeInfo> = {}
  const birthdaysByDate: Record<string, CalendarEvent[]> = {}

  for (const event of events) {
    if (!event.startDate || !event.endDate) continue

    const isTentative = event.summary.includes('?')
    const isTrip = getTripInfo(event).isTrip
    const isVisit = isVisitEvent(event)
    const isBirthday = isBirthdayEvent(event)

    // Skip events that aren't tentative, trip, visit, or birthday
    if (!isTentative && !isTrip && !isVisit && !isBirthday) continue

    const eventColor = getEventColor(event)

    // Generate all dates this event covers
    const startDate = parseDateString(event.startDate)
    const endDate = parseDateString(event.endDate)

    const currentDate = new Date(startDate)
    let dayIndex = 0
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    while (currentDate < endDate) {
      const dateStr = formatDateString(currentDate)

      if (isTentative || isTrip || isVisit) {
        const existing = tentativeByDate[dateStr]
        // Prioritize trip color over tentative color over visit color if multiple exist
        const colorToUse = existing?.eventColor && !isTrip && !isVisit ? existing.eventColor : eventColor
        tentativeByDate[dateStr] = {
          hasTentative: existing?.hasTentative || isTentative,
          hasTrip: existing?.hasTrip || isTrip,
          hasVisit: existing?.hasVisit || isVisit,
          isFirstDay: existing?.isFirstDay || dayIndex === 0,
          isLastDay: existing?.isLastDay || dayIndex === totalDays - 1,
          eventColor: colorToUse,
        }
      }

      if (isBirthday) {
        if (!birthdaysByDate[dateStr]) birthdaysByDate[dateStr] = []
        birthdaysByDate[dateStr].push(event)
      }

      currentDate.setDate(currentDate.getDate() + 1)
      dayIndex++
    }
  }

  return { tentativeByDate, birthdaysByDate }
}

type LinearDayCellProps = {
  day: DayInfo
  cellSize: number
  isFirstOfMonth: boolean
  tentativeInfo: TentativeInfo
  birthdayEvents: CalendarEvent[]
}

function LinearDayCell(props: LinearDayCellProps) {
  const { day, cellSize, isFirstOfMonth, tentativeInfo, birthdayEvents } = props

  // Convert DayInfo to CalendarDay for reusing DayCell
  const calendarDay: CalendarDay = {
    date: day.date,
    dayOfMonth: day.dayOfMonth,
    isCurrentMonth: true,
    isToday: day.isToday,
    dateString: day.dateString,
  }

  const monthLabel = isFirstOfMonth ? getMonthName(day.month).toUpperCase() : undefined

  return <DayCell day={calendarDay} size={cellSize} tentativeInfo={tentativeInfo} birthdayEvents={birthdayEvents} monthLabel={monthLabel} />
}

// --- Event Bar Segments ---

type EventSegment = {
  event: CalendarEvent
  gridColumnStart: number
  gridColumnEnd: number
  gridRowStart: number
  track: number // Which track (vertical slot) within the row
  isStart: boolean // Is this the first segment of the event?
  isEnd: boolean // Is this the last segment of the event?
}

type CalculateEventSegmentsParams = {
  events: CalendarEvent[]
  days: DayInfo[]
  paddingDays: number
  columns: number
  year: number
}

function calculateEventSegments(params: CalculateEventSegmentsParams): EventSegment[] {
  const { events, days, paddingDays, columns, year } = params

  // Filter out birthday events - show all events with dates (including single-day)
  const displayEvents = events.filter((event) => {
    if (isBirthdayEvent(event)) return false
    if (!event.startDate || !event.endDate) return false
    return true
  })

  // Create a map of dateString -> dayIndex for fast lookup
  const dateToIndex: Record<string, number> = {}
  days.forEach((day, index) => {
    dateToIndex[day.dateString] = index
  })

  // Calculate raw segments for all events (without track info)
  const rawSegments: Array<Omit<EventSegment, 'track'>> = []

  for (const event of displayEvents) {
    const eventSegments = calculateSegmentsForEvent({
      event,
      dateToIndex,
      paddingDays,
      columns,
      year,
      totalDays: days.length,
    })
    rawSegments.push(...eventSegments)
  }

  // Allocate tracks to avoid overlapping events
  const segmentsWithTracks = allocateTracksToSegments(rawSegments, columns)

  return segmentsWithTracks
}

// Allocate tracks (vertical slots) to segments to prevent overlapping
function allocateTracksToSegments(rawSegments: Array<Omit<EventSegment, 'track'>>, columns: number): EventSegment[] {
  // Group segments by row
  const segmentsByRow: Record<number, Array<Omit<EventSegment, 'track'>>> = {}

  for (const segment of rawSegments) {
    const row = segment.gridRowStart
    if (!segmentsByRow[row]) segmentsByRow[row] = []
    segmentsByRow[row].push(segment)
  }

  const result: EventSegment[] = []

  // Process each row independently
  for (const rowStr in segmentsByRow) {
    const row = parseInt(rowStr)
    const rowSegments = segmentsByRow[row]

    // Sort segments by start column (leftmost first), then by span (longer first)
    rowSegments.sort((a, b) => {
      if (a.gridColumnStart !== b.gridColumnStart) {
        return a.gridColumnStart - b.gridColumnStart
      }
      return b.gridColumnEnd - b.gridColumnStart - (a.gridColumnEnd - a.gridColumnStart)
    })

    // Track allocation: for each column position, which tracks are occupied
    // trackEndColumns[track] = the column where that track becomes free
    const trackEndColumns: number[] = []

    for (const segment of rowSegments) {
      const startCol = segment.gridColumnStart
      const endCol = segment.gridColumnEnd

      // Find the first available track
      let track = 0
      while (track < trackEndColumns.length && trackEndColumns[track] > startCol) {
        track++
      }

      // Reserve this track
      trackEndColumns[track] = endCol

      result.push({ ...segment, track })
    }
  }

  return result
}

type CalculateSegmentsForEventParams = {
  event: CalendarEvent
  dateToIndex: Record<string, number>
  paddingDays: number
  columns: number
  year: number
  totalDays: number
}

function calculateSegmentsForEvent(params: CalculateSegmentsForEventParams): Array<Omit<EventSegment, 'track'>> {
  const { event, dateToIndex, paddingDays, columns, year } = params

  const segments: Array<Omit<EventSegment, 'track'>> = []

  if (!event.startDate || !event.endDate) return segments

  // Use parseDateString to avoid timezone issues (new Date("YYYY-MM-DD") creates UTC midnight)
  const startDate = parseDateString(event.startDate)
  const endDate = parseDateString(event.endDate)

  // endDate is exclusive (Google Calendar convention), make it inclusive
  endDate.setDate(endDate.getDate() - 1)

  // Clamp to current year
  const yearStart = new Date(year, 0, 1)
  const yearEnd = new Date(year, 11, 31)

  const clampedStart = startDate < yearStart ? yearStart : startDate
  const clampedEnd = endDate > yearEnd ? yearEnd : endDate

  const startDateStr = formatDateString(clampedStart)
  const endDateStr = formatDateString(clampedEnd)

  const startDayIndex = dateToIndex[startDateStr]
  const endDayIndex = dateToIndex[endDateStr]

  // Event not in this year
  if (startDayIndex === undefined || endDayIndex === undefined) return segments

  // Calculate grid positions (1-indexed for CSS grid)
  const startGridPos = paddingDays + startDayIndex + 1
  const endGridPos = paddingDays + endDayIndex + 1

  // Calculate which rows the event spans
  const startRow = Math.floor((startGridPos - 1) / columns)
  const endRow = Math.floor((endGridPos - 1) / columns)

  // If event is within a single row
  if (startRow === endRow) {
    segments.push({
      event,
      gridColumnStart: ((startGridPos - 1) % columns) + 1,
      gridColumnEnd: ((endGridPos - 1) % columns) + 2, // +2 because grid-column-end is exclusive
      gridRowStart: startRow + 1,
      isStart: true,
      isEnd: true,
    })
  } else {
    // Event spans multiple rows - create segments for each row
    for (let row = startRow; row <= endRow; row++) {
      const isFirstRow = row === startRow
      const isLastRow = row === endRow

      let colStart: number
      let colEnd: number

      if (isFirstRow) {
        colStart = ((startGridPos - 1) % columns) + 1
        colEnd = columns + 1 // Extend to end of row
      } else if (isLastRow) {
        colStart = 1
        colEnd = ((endGridPos - 1) % columns) + 2
      } else {
        // Middle rows span entire width
        colStart = 1
        colEnd = columns + 1
      }

      segments.push({
        event,
        gridColumnStart: colStart,
        gridColumnEnd: colEnd,
        gridRowStart: row + 1,
        isStart: isFirstRow,
        isEnd: isLastRow,
      })
    }
  }

  return segments
}

type EventBarSegmentProps = {
  segment: EventSegment
  cellSize: number
}

const BAR_HEIGHT = 14
const BAR_GAP = 1
const TOP_OFFSET = 20 // Start events below the day number

function EventBarSegment(props: EventBarSegmentProps) {
  const { segment, cellSize } = props
  const { event, gridColumnStart, gridColumnEnd, gridRowStart, track, isStart, isEnd } = segment

  // Get background color - priority: event's colorId > calendar's color > default
  const backgroundColor = event.colorId
    ? EVENT_COLORS[event.colorId] || EVENT_COLORS.default
    : event.backgroundColor || EVENT_COLORS.default

  // Calculate absolute position based on grid cell
  // gridColumnStart and gridRowStart are 1-indexed
  const paddingTop = 0
  const horizontalPadding = 6

  const left = (gridColumnStart - 1) * cellSize + (isStart ? horizontalPadding : 0)
  const rowTop = paddingTop + (gridRowStart - 1) * cellSize
  const top = rowTop + TOP_OFFSET + track * (BAR_HEIGHT + BAR_GAP)
  const width = (gridColumnEnd - gridColumnStart) * cellSize - (isStart ? horizontalPadding : 0) - (isEnd ? horizontalPadding : 0)

  const textColor = shouldUseWhiteText(backgroundColor) ? 'text-white' : 'text-black'

  // Trip detection
  const tripInfo = getTripInfo(event)
  const spanDays = gridColumnEnd - gridColumnStart
  const showReturnInfo = tripInfo.returnFlight && spanDays >= 4 && width > 300
  const trip = getTripFromEvent(event)
  const showTripPopover = !!trip

  function handleClick() {
    if (event.htmlLink) {
      window.open(event.htmlLink, '_blank')
    }
  }

  const baseWrapperClassName = 'absolute pointer-events-auto cursor-pointer z-10'
  const baseBarClassName = `h-full overflow-hidden text-ellipsis whitespace-nowrap text-[10px] font-medium leading-[14px] px-1 hover:brightness-110 ${textColor}`

  if (!showTripPopover) {
    return (
      <div
        className={baseWrapperClassName}
        style={{
          left,
          top,
          width,
          height: BAR_HEIGHT,
        }}
        onClick={handleClick}
      >
        <div
          className={baseBarClassName}
          style={{
            backgroundColor,
            borderRadius: isStart && isEnd ? 4 : isStart ? '4px 0 0 4px' : isEnd ? '0 4px 4px 0' : 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            height: BAR_HEIGHT,
          }}
        >
          {isStart && (
            <>
              <TripIcon tripType={tripInfo.tripType} className={textColor} />
              <span className='truncate'>{event.summary}</span>
              {showReturnInfo && (
                <span className='ml-auto opacity-70 text-[9px] shrink-0'>↩ {formatMinimalFlightInfo(tripInfo.returnFlight!)}</span>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={120}
        closeDelay={100}
        nativeButton={false}
        render={(triggerProps) => (
          <div
            {...triggerProps}
            className={cn(baseWrapperClassName, triggerProps.className)}
            style={{
              ...triggerProps.style,
              left,
              top,
              width,
              height: BAR_HEIGHT,
            }}
            onClick={(eventClick) => {
              triggerProps.onClick?.(eventClick)
              if (eventClick.defaultPrevented) return
              handleClick()
            }}
          >
            <div
              className={baseBarClassName}
              style={{
                backgroundColor,
                borderRadius: isStart && isEnd ? 4 : isStart ? '4px 0 0 4px' : isEnd ? '0 4px 4px 0' : 0,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                height: BAR_HEIGHT,
              }}
            >
              {isStart && (
                <>
                  <TripIcon tripType={tripInfo.tripType} className={textColor} />
                  <span className='truncate'>{event.summary}</span>
                  {showReturnInfo && (
                    <span className='ml-auto opacity-70 text-[9px] shrink-0'>↩ {formatMinimalFlightInfo(tripInfo.returnFlight!)}</span>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      />
      <PopoverContent side='top' align='start' className='p-0'>
        <TripPopoverContent trip={trip!} />
      </PopoverContent>
    </Popover>
  )
}

type TripIconProps = {
  tripType: 'flight' | 'car' | null
  className?: string
}

function TripIcon(props: TripIconProps) {
  const { tripType, className } = props

  if (tripType === 'flight') return <Plane className={`size-2.5 shrink-0 ${className}`} />
  if (tripType === 'car') return <Car className={`size-2.5 shrink-0 ${className}`} />

  return null
}

function shouldUseWhiteText(hexColor: string): boolean {
  const hex = hexColor.replace('#', '')
  if (hex.length !== 6) return false

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance < 0.5
}

function PaddingCell() {
  return <div className='border-r border-b border-black/5 ' />
}
