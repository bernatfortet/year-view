import { Plane, Car } from 'lucide-react'

import { Row } from '@/styles'

import type { EventBarProps } from './types'
import { EVENT_COLORS } from './types'
import { formatMinimalFlightInfo, getTripInfo } from './utils'

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

  // Trip detection
  const tripInfo = getTripInfo(event)
  const showReturnInfo = tripInfo.returnFlight && event.spanDays >= 3

  function handleClick() {
    if (event.htmlLink) {
      window.open(event.htmlLink, '_blank')
    }
  }

  return (
    <Row
      className={`h-4 items-center gap-1 px-1.5 text-[10px] font-medium ${textColor} truncate cursor-pointer hover:brightness-110 pointer-events-auto ${roundedLeft} ${roundedRight} ${marginLeft} ${marginRight}`}
      style={{
        backgroundColor,
        gridColumn: `${gridColumnStart} / ${gridColumnEnd}`,
        gridRow: event.row + 1,
      }}
      title={event.summary}
      onClick={handleClick}
    >
      {!event.continuesFromPrevious && (
        <>
          <TripIcon tripType={tripInfo.tripType} className={textColor} />
          <span className='truncate'>{event.summary}</span>
          {showReturnInfo && (
            <span className='ml-auto opacity-70 text-[9px] shrink-0'>
              ↩ {formatMinimalFlightInfo(tripInfo.returnFlight!)}
            </span>
          )}
        </>
      )}
    </Row>
  )
}

type TripIconProps = {
  tripType: 'flight' | 'car' | null
  className?: string
}

function TripIcon(props: TripIconProps) {
  const { tripType, className } = props

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

