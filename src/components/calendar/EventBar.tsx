import { Plane, Car, PlaneLanding } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Row } from '@/styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import type { EventBarProps } from './types'
import { EVENT_COLORS } from './types'
import { formatMinimalFlightInfo, getTripInfo, isVisitEvent } from './utils'
import { TripPopoverContent } from './TripPopoverContent'
import { getTripFromEvent } from '../trips/trip-utils'

export function EventBar({ event }: EventBarProps) {
  // Priority: event's own colorId > calendar's backgroundColor > default
  const backgroundColor = event.colorId
    ? EVENT_COLORS[event.colorId] || EVENT_COLORS.default
    : event.backgroundColor || EVENT_COLORS.default

  const textColor = shouldUseWhiteText(backgroundColor) ? 'text-white' : 'text-black'

  // Calculate grid column positioning (1-indexed for CSS grid)
  const gridColumnStart = event.startColumn + 1
  const gridColumnEnd = gridColumnStart + event.spanDays

  // Determine border radius and padding based on continuation
  const roundedLeft = event.continuesFromPrevious ? '' : 'rounded-l-md'
  const roundedRight = event.continuesAfter ? '' : 'rounded-r-md'
  const marginLeft = event.continuesFromPrevious ? '' : 'ml-1'
  const marginRight = event.continuesAfter ? '' : 'mr-1'

  // Trip and visit detection
  const tripInfo = getTripInfo(event)
  const showReturnInfo = tripInfo.returnFlight && event.spanDays >= 3
  const returnInfo = showReturnInfo ? formatMinimalFlightInfo(tripInfo.returnFlight!) : null
  const isVisit = isVisitEvent(event)
  const trip = getTripFromEvent(event)
  const showTripPopover = !!trip

  function handleClick() {
    if (event.htmlLink) {
      window.open(event.htmlLink, '_blank')
    }
  }

  const baseClassName = `h-4 items-center gap-1 px-1.5 text-[10px] font-medium ${textColor} truncate cursor-pointer hover:brightness-110 data-[popup-open]:brightness-110 pointer-events-auto ${roundedLeft} ${roundedRight} ${marginLeft} ${marginRight}`

  if (!showTripPopover) {
    return (
      <Row
        className={baseClassName}
        style={{
          backgroundColor,
          gridColumn: `${gridColumnStart} / ${gridColumnEnd}`,
          gridRow: event.row + 1,
        }}
        title={event.summary}
        onClick={handleClick}
      >
        <EventBarContent
          eventSummary={event.summary}
          isContinuation={event.continuesFromPrevious}
          tripType={tripInfo.tripType}
          isVisit={isVisit}
          textColor={textColor}
          returnInfo={returnInfo}
        />
      </Row>
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
          <Row
            {...triggerProps}
            className={cn(baseClassName, triggerProps.className)}
            style={{
              ...triggerProps.style,
              backgroundColor,
              gridColumn: `${gridColumnStart} / ${gridColumnEnd}`,
              gridRow: event.row + 1,
            }}
            onClick={(eventClick) => {
              triggerProps.onClick?.(eventClick)
              if (eventClick.defaultPrevented) return
              handleClick()
            }}
          >
            <EventBarContent
              eventSummary={event.summary}
              isContinuation={event.continuesFromPrevious}
              tripType={tripInfo.tripType}
              isVisit={isVisit}
              textColor={textColor}
              returnInfo={returnInfo}
            />
          </Row>
        )}
      />
      <PopoverContent side='top' align='start' className='p-0 max-h-[calc(100vh-16px)] overflow-y-auto' hideArrow>
        <TripPopoverContent trip={trip!} />
      </PopoverContent>
    </Popover>
  )
}

type EventBarContentProps = {
  eventSummary: string
  isContinuation: boolean
  tripType: 'flight' | 'car' | null
  isVisit: boolean
  textColor: string
  returnInfo: string | null
}

function EventBarContent(props: EventBarContentProps) {
  const { eventSummary, isContinuation, tripType, isVisit, textColor, returnInfo } = props

  if (isContinuation) {
    return <span className='truncate'>...{eventSummary}</span>
  }

  return (
    <>
      <EventIcon tripType={tripType} isVisit={isVisit} className={textColor} />
      <span className='truncate'>{eventSummary}</span>
      {returnInfo && <span className='ml-auto opacity-70 text-[9px] shrink-0'>↩ {returnInfo}</span>}
    </>
  )
}

type EventIconProps = {
  tripType: 'flight' | 'car' | null
  isVisit: boolean
  className?: string
}

function EventIcon(props: EventIconProps) {
  const { tripType, isVisit, className } = props

  if (isVisit) return <PlaneLanding className={`size-2.5 shrink-0 ${className}`} />
  if (tripType === 'flight') return <Plane className={`size-2.5 shrink-0 ${className}`} />
  if (tripType === 'car') return <Car className={`size-2.5 shrink-0 ${className}`} />

  return null
}

function shouldUseWhiteText(hexColor: string): boolean {
  const hex = hexColor.replace('#', '')

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Calculate relative luminance using sRGB formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance < 0.5
}

