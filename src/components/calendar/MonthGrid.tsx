import { useEffect, useRef } from 'react'

import { Row } from '@/styles'
import type { CalendarDay, CalendarEvent, MonthGridProps } from './types'
import { DayCell } from './DayCell'
import { EventBar } from './EventBar'
import { $activeMonth } from './calendar.store'
import {
  getBirthdayEventsForDay,
  getMonthGridDays,
  getMonthName,
  getTentativeInfoForDay,
  groupDaysIntoWeeks,
  isBirthdayEvent,
  layoutEventsForWeek,
} from './utils'

export function MonthGrid({ year, month, events, daySize }: MonthGridProps) {
  const days = getMonthGridDays(year, month)
  const weeks = groupDaysIntoWeeks(days)
  const monthName = getMonthName(month)
  const ref = useRef<HTMLDivElement>(null)

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Find the scroll container (SidebarInset)
    const scrollContainer = element.closest('[class*="overflow-auto"]')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            $activeMonth.set(month)
          }
        })
      },
      {
        root: scrollContainer,
        threshold: 0,
        rootMargin: '-45% 0px -45% 0px',
      },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [month])

  return (
    <Row ref={ref} data-month={month} className='items-center gap-12'>
      {/* Large Month Name - Left side */}
      <div
        className={`w-56 text-right font-bold leading-none select-none ${isCurrentMonth ? 'text-brand-red' : 'text-month-label-inactive'}`}
        style={{ fontSize: '100px' }}
      >
        {monthName}
      </div>

      {/* Calendar Grid */}
      <div>
        {weeks.map((week, weekIndex) => {
          const nonBirthdayEvents = events.filter((event) => !isBirthdayEvent(event))
          const layoutEvents = layoutEventsForWeek(nonBirthdayEvents, week)
          const maxRow = layoutEvents.reduce((max, event) => Math.max(max, event.row), -1)
          const eventRowCount = maxRow + 1

          return (
            <div key={weekIndex} className='relative'>
              {/* Day Grid */}
              <div className='grid grid-cols-7'>
                {week.map((day) => (
                  <DayCell
                    key={day.dateString}
                    day={day}
                    size={daySize}
                    tentativeInfo={getTentativeInfoForDay(day, events)}
                    birthdayEvents={getBirthdayEventsForDay(day, events)}
                  />
                ))}
              </div>

              {/* Event Layer - Absolutely positioned overlay */}
              {eventRowCount > 0 && (
                <div
                  className='absolute inset-0 grid grid-cols-7 pointer-events-none'
                  style={{
                    paddingTop: Math.max(20, daySize * 0.28),
                    gridTemplateRows: `repeat(${eventRowCount}, 1.125rem)`,
                  }}
                >
                  {layoutEvents.map((event) => (
                    <EventBar key={`${event.id}-${weekIndex}`} event={event} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Row>
  )
}

