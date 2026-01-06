import type { MonthGridProps } from './types'
import { DayCell } from './DayCell'
import { EventBar } from './EventBar'
import { getMonthGridDays, getMonthName, groupDaysIntoWeeks, layoutEventsForWeek } from './utils'

export function MonthGrid({ year, month, events, daySize }: MonthGridProps) {
  const days = getMonthGridDays(year, month)
  const weeks = groupDaysIntoWeeks(days)
  const monthName = getMonthName(month)

  return (
    <div className='flex items-start gap-4'>
      {/* Month Label - Floating on the left */}
      <div className='w-24 pt-1 text-right'>
        <span className='text-sm font-medium text-stone-500'>{monthName}</span>
      </div>

      {/* Days Grid */}
      <div>
        {weeks.map((week, weekIndex) => {
          const layoutEvents = layoutEventsForWeek(events, week)
          const maxRow = layoutEvents.reduce((max, event) => Math.max(max, event.row), -1)
          const eventRowCount = maxRow + 1

          return (
            <div key={weekIndex} className='relative'>
              {/* Day Grid */}
              <div className='grid grid-cols-7'>
                {week.map((day) => (
                  <DayCell key={day.dateString} day={day} size={daySize} />
                ))}
              </div>

              {/* Event Layer - Absolutely positioned overlay */}
              {eventRowCount > 0 && (
                <div
                  className='absolute inset-0 grid grid-cols-7 pointer-events-none'
                  style={{
                    paddingTop: 22,
                    gridTemplateRows: `repeat(${eventRowCount}, 1.125rem)`,
                  }}
                >
                  {layoutEvents.map((event) => (
                    <EventBar key={`${event.id}-${weekIndex}`} event={event} weekIndex={weekIndex} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
