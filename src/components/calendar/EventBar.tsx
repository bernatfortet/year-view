import type { EventBarProps } from './types'
import { EVENT_COLORS } from './types'

export function EventBar({ event }: EventBarProps) {
  const backgroundColor = event.colorId
    ? EVENT_COLORS[event.colorId] || EVENT_COLORS.default
    : EVENT_COLORS.default

  // Calculate grid column positioning (1-indexed for CSS grid)
  const gridColumnStart = event.startColumn + 1
  const gridColumnEnd = gridColumnStart + event.spanDays

  // Determine border radius based on continuation
  const roundedLeft = event.continuesFromPrevious ? '' : 'rounded-l-md'
  const roundedRight = event.continuesAfter ? '' : 'rounded-r-md'

  return (
    <div
      className={`h-4 flex items-center px-1.5 text-[10px] font-medium text-white truncate cursor-pointer hover:brightness-110 transition-all pointer-events-auto ${roundedLeft} ${roundedRight}`}
      style={{
        backgroundColor,
        gridColumn: `${gridColumnStart} / ${gridColumnEnd}`,
        gridRow: event.row + 1,
      }}
      title={event.summary}
    >
      {!event.continuesFromPrevious && (
        <span className="truncate">{event.summary}</span>
      )}
    </div>
  )
}

