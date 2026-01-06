import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { YearViewProps } from './types'
import { MonthGrid } from './MonthGrid'
import { getWeekDayNames } from './utils'

const DEFAULT_DAY_SIZE = 80

export function YearView({ year, events, onYearChange, daySize = DEFAULT_DAY_SIZE }: YearViewProps) {
  const months = Array.from({ length: 12 }, (_, index) => index)
  const weekDayNames = getWeekDayNames()

  const handlePreviousYear = () => {
    onYearChange?.(year - 1)
  }

  const handleNextYear = () => {
    onYearChange?.(year + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-white">
      {/* Sticky Header with Year Navigation and Day Names */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-stone-100 via-stone-100 to-stone-100/95 backdrop-blur-sm pb-2 pt-6 px-6">
        {/* Year Header with Navigation */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <button
            onClick={handlePreviousYear}
            className="p-2 rounded-lg bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors shadow-sm border border-stone-200"
            aria-label="Previous year"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <h1 className="text-4xl font-bold text-stone-800 tracking-tight">
            {year}
          </h1>

          <button
            onClick={handleNextYear}
            className="p-2 rounded-lg bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors shadow-sm border border-stone-200"
            aria-label="Next year"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Sticky Week Day Headers */}
        <div className="flex items-start gap-4 max-w-fit mx-auto">
          <div className="w-24" /> {/* Spacer for month label alignment */}
          <div className="grid grid-cols-7">
            {weekDayNames.map((dayName) => (
              <div
                key={dayName}
                className="text-center text-sm font-medium text-stone-400"
                style={{ width: daySize }}
              >
                {dayName.charAt(0)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Months Grid - Single Column Layout */}
      <div className="max-w-fit mx-auto space-y-2 px-6 pb-6">
        {months.map((month) => (
          <MonthGrid
            key={month}
            year={year}
            month={month}
            events={events}
            daySize={daySize}
          />
        ))}
      </div>
    </div>
  )
}

