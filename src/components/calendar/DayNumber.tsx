type DayNumberProps = {
  day: number
  isToday?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function DayNumber(props: DayNumberProps) {
  const { day, isToday = false, size = 'md' } = props

  const sizeClasses = {
    sm: 'text-[10px] min-w-4',
    md: 'text-[11px] min-w-5',
    lg: 'text-[11px] min-w-6',
  }

  if (isToday) {
    return (
      <span
        className={`font-mono select-none bg-brand-red text-white rounded-full px-1.5 py-0.5 font-medium leading-none tabular-nums ${sizeClasses[size]}`}
      >
        {day}
      </span>
    )
  }

  return <span className={`font-mono font-medium tabular-nums ${sizeClasses[size]}`}>{day}</span>
}
