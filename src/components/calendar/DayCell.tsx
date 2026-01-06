import type { DayCellProps } from './types'

export function DayCell({ day, size }: DayCellProps) {
  const baseClasses =
    'flex items-start justify-start p-1 font-medium transition-colors border border-stone-200'

  const stateClasses = day.isToday
    ? 'bg-indigo-500 text-white border-indigo-500'
    : day.isCurrentMonth
      ? 'text-stone-700 bg-white hover:bg-stone-50'
      : 'bg-stone-50/50'

  // Scale font size based on cell size
  const fontSize = size >= 80 ? 'text-sm' : size >= 60 ? 'text-xs' : 'text-[10px]'

  return (
    <div
      className={`${baseClasses} ${stateClasses} ${fontSize}`}
      style={{ width: size, height: size }}
    >
      {day.isCurrentMonth && day.dayOfMonth}
    </div>
  )
}

