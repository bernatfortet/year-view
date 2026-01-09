import { Gift } from 'lucide-react'

import { Row, Column } from '@/styles'
import type { CalendarEvent, DayCellProps, TentativeInfo } from './types'
import { EVENT_COLORS } from './types'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DayNumber } from './DayNumber'
import { HatchedPattern } from '@/components/ui/HatchedPattern'

const DEFAULT_TENTATIVE_INFO: TentativeInfo = { hasTentative: false, isFirstDay: false, isLastDay: false }

export function DayCell({ day, size, tentativeInfo = DEFAULT_TENTATIVE_INFO, birthdayEvents = [], monthLabel }: DayCellProps) {
  if (!day.isCurrentMonth) {
    return <OutsideDayCell size={size} />
  }

  const jsDay = day.date.getDay()
  const isWeekend = jsDay === 0 || jsDay === 6

  const bgClass = isWeekend ? 'bg-weekend-bg' : 'bg-white'
  const textClass = day.isToday ? '' : 'text-tertiary'
  const todayBorder = day.isToday ? 'border-2 border-brand-red' : 'border-r border-b border-stone-200'
  const baseClasses = 'items-start justify-between p-1 hover:bg-stone-50 hover:text-ink-primary'
  const dayNumberSize = size >= 80 ? 'lg' : size >= 60 ? 'md' : 'sm'

  return (
    <Row className={`relative ${baseClasses} ${bgClass} ${textClass} ${todayBorder}`} style={{ width: size, height: size }}>
      {tentativeInfo.hasTentative && <HatchedPattern color='#fbbf24' strokeWidth={1} spacing={5} />}
      {tentativeInfo.hasTentative && <TentativeBorders tentativeInfo={tentativeInfo} />}
      {monthLabel && <div className='absolute left-0 top-0 bottom-0 w-0.5 bg-brand-blue' style={{ left: '-1px' }} />}
      <Row className='relative z-10 items-center gap-1'>
        <DayNumber day={day.dayOfMonth} isToday={day.isToday} size={dayNumberSize} />
        {monthLabel && (
          <span className='text-[10px] font-bold text-white bg-brand-blue px-1 py-0.5 rounded whitespace-nowrap leading-none'>
            {monthLabel}
          </span>
        )}
      </Row>
      {birthdayEvents.length > 0 && <BirthdayIndicator events={birthdayEvents} />}
    </Row>
  )
}

const TENTATIVE_BORDER_COLOR = '#f59e0b'
const TENTATIVE_BORDER_THICKNESS = 1

function TentativeBorders({ tentativeInfo }: { tentativeInfo: TentativeInfo }) {
  return (
    <>
      {/* Top border - always for tentative */}
      <div
        className='absolute top-0 left-0 right-0'
        style={{ backgroundColor: TENTATIVE_BORDER_COLOR, height: TENTATIVE_BORDER_THICKNESS }}
      />
      {/* Bottom border - always for tentative */}
      <div
        className='absolute bottom-0 left-0 right-0'
        style={{ backgroundColor: TENTATIVE_BORDER_COLOR, height: TENTATIVE_BORDER_THICKNESS }}
      />
      {/* Left border - only for first day */}
      {tentativeInfo.isFirstDay && (
        <div
          className='absolute top-0 bottom-0 left-0'
          style={{ backgroundColor: TENTATIVE_BORDER_COLOR, width: TENTATIVE_BORDER_THICKNESS }}
        />
      )}
      {/* Right border - only for last day */}
      {tentativeInfo.isLastDay && (
        <div
          className='absolute top-0 bottom-0 right-0'
          style={{ backgroundColor: TENTATIVE_BORDER_COLOR, width: TENTATIVE_BORDER_THICKNESS }}
        />
      )}
    </>
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
        <Badge variant='outline' className='relative z-10 h-5 px-1 text-[10px] cursor-pointer bg-stone-100 border-stone-300 text-tertiary'>
          <Gift className='w-4 h-4' />
          {events.length}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side='top' hideArrow className='p-2 bg-white text-primary border border-stone-200 shadow-md'>
        <Column className='gap-1'>
          {events.map((event) => (
            <BirthdayEventBar key={event.id} event={event} />
          ))}
        </Column>
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
    <Row className='h-4 items-center px-1.5 text-[10px] font-medium text-black truncate rounded-md min-w-32' style={{ backgroundColor }}>
      <span className='truncate'>{event.summary}</span>
    </Row>
  )
}
