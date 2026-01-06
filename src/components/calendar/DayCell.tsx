import type { DayCellProps } from './types'

export function DayCell({ day, size }: DayCellProps) {
  if (!day.isCurrentMonth) {
    return <OutsideDayCell size={size} />
  }

  const jsDay = day.date.getDay()
  const isWeekend = jsDay === 0 || jsDay === 6

  const baseClasses = 'flex items-start justify-start p-1 font-medium transition-colors border hover:bg-stone-50'
  const bgClass = isWeekend ? 'bg-stone-50' : 'bg-white'
  const stateClasses = day.isToday ? 'border-stone-900 text-stone-900' : 'border-stone-200 text-stone-400'

  // Scale font size based on cell size
  const fontSize = size >= 80 ? 'text-sm' : size >= 60 ? 'text-xs' : 'text-[10px]'

  return (
    <div className={`${baseClasses} ${bgClass} ${stateClasses} ${fontSize}`} style={{ width: size, height: size }}>
      {day.dayOfMonth}
    </div>
  )
}

type OutsideDayCellProps = {
  size: number
}

function OutsideDayCell({ size }: OutsideDayCellProps) {
  return <div className='invisible' style={{ width: size, height: size }} />
}
