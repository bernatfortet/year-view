import { useStore } from '@nanostores/react'

import type { YearViewProps } from './types'
import { MonthGrid } from './MonthGrid'
import { $activeMonth } from './calendar.store'
import { getMonthName, getWeekDayNames } from './utils'

const DEFAULT_DAY_SIZE = 100

export function YearView({ year, events, daySize = DEFAULT_DAY_SIZE }: YearViewProps) {
  const months = Array.from({ length: 12 }, (_, index) => index)
  const weekDayNames = getWeekDayNames()
  const activeMonth = useStore($activeMonth)

  function handleMonthClick(month: number) {
    const element = document.querySelector(`[data-month="${month}"]`)
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-white'>
      {/* Fixed Month Sidebar - Right side, centered vertically */}
      <div className='fixed right-0 top-10 bottom-0 w-28 flex flex-col justify-center z-10'>
        {months.map((month) => {
          const isActive = month === activeMonth

          return (
            <button
              key={month}
              onClick={() => handleMonthClick(month)}
              className={`text-left pl-4 py-0.5 text-3xl font-medium transition-all duration-200 cursor-pointer hover:text-stone-500 ${
                isActive ? 'text-stone-800 font-bold' : 'text-stone-300'
              }`}
            >
              {getMonthName(month)}
            </button>
          )
        })}
      </div>

      {/* Sticky Week Day Headers - Edge to edge */}
      <div className='sticky top-0 z-10 bg-background border-b w-full'>
        <div className='flex justify-center py-2 mr-28'>
          <div className='grid grid-cols-7'>
            {weekDayNames.map((dayName) => (
              <div key={dayName} className='text-center text-sm font-medium text-stone-400' style={{ width: daySize }}>
                {dayName}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area - centered */}
      <div className='mr-28 flex flex-col items-center'>
        {/* Months Grid - Centered */}
        <div className='space-y-2 py-6'>
          {months.map((month) => (
            <MonthGrid key={month} year={year} month={month} events={events} daySize={daySize} />
          ))}
        </div>
      </div>
    </div>
  )
}
