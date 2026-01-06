import { Gift } from 'lucide-react'

import type { CalendarEvent, DayCellProps } from './types'
import { EVENT_COLORS } from './types'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function DayCell({ day, size, hasTentativeEvent, birthdayEvents = [] }: DayCellProps) {
  if (!day.isCurrentMonth) {
    return <OutsideDayCell size={size} />
  }

  const jsDay = day.date.getDay()
  const isWeekend = jsDay === 0 || jsDay === 6

  const baseClasses = 'flex items-start justify-between p-1 font-medium transition-colors border border-stone-200 hover:bg-stone-50'
  const bgClass = hasTentativeEvent ? 'bg-amber-50' : isWeekend ? 'bg-stone-50' : 'bg-white'
  const textClass = day.isToday ? '' : 'text-stone-400'
  const fontSize = size >= 80 ? 'text-sm' : size >= 60 ? 'text-xs' : 'text-[10px]'

  return (
    <div className={`${baseClasses} ${bgClass} ${textClass} ${fontSize}`} style={{ width: size, height: size }}>
      {day.isToday ? (
        <span className='bg-blue-600 text-white rounded-full px-1.5 py-0.5 text-xs font-medium leading-none'>{day.dayOfMonth}</span>
      ) : (
        <span>{day.dayOfMonth}</span>
      )}
      {birthdayEvents.length > 0 && <BirthdayIndicator events={birthdayEvents} />}
    </div>
  )
}

type OutsideDayCellProps = {
  size: number
}

function OutsideDayCell({ size }: OutsideDayCellProps) {
  return <div className='invisible' style={{ width: size, height: size }} />
}

type BirthdayIndicatorProps = {
  events: CalendarEvent[]
}

function BirthdayIndicator({ events }: BirthdayIndicatorProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant='outline' className='h-5 px-1 text-[10px] cursor-pointer bg-stone-100 border-stone-300 text-stone-600'>
          <Gift className='w-4 h-4' />
          {events.length}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side='top' hideArrow className='p-2 bg-white text-stone-900 border border-stone-200 shadow-md'>
        <div className='flex flex-col gap-1'>
          {events.map((event) => (
            <BirthdayEventBar key={event.id} event={event} />
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

type BirthdayEventBarProps = {
  event: CalendarEvent
}

function BirthdayEventBar({ event }: BirthdayEventBarProps) {
  const backgroundColor = event.colorId
    ? EVENT_COLORS[event.colorId] || EVENT_COLORS.default
    : event.backgroundColor || EVENT_COLORS.default

  return (
    <div
      className='h-4 flex items-center px-1.5 text-[10px] font-medium text-black truncate rounded-md min-w-32'
      style={{ backgroundColor }}
    >
      <span className='truncate'>{event.summary}</span>
    </div>
  )
}
