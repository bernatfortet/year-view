/**
 * Represents an all-day calendar event from Google Calendar
 */
export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  startDate: string // YYYY-MM-DD format
  endDate: string // YYYY-MM-DD format (exclusive, following Google Calendar convention)
  colorId?: string
  status: 'confirmed' | 'tentative' | 'cancelled'
}

/**
 * Event with computed layout information for rendering
 */
export interface LayoutEvent extends CalendarEvent {
  row: number // Vertical position (0 = top row)
  startColumn: number // 0-6 (Monday = 0, Sunday = 6)
  spanDays: number // Number of days the event spans in this week/view
  continuesFromPrevious: boolean // Event started before this week
  continuesAfter: boolean // Event continues after this week
}

/**
 * Represents a single day in the calendar grid
 */
export interface CalendarDay {
  date: Date
  dayOfMonth: number
  isCurrentMonth: boolean
  isToday: boolean
  dateString: string // YYYY-MM-DD format for easy comparison
}

/**
 * Props for the YearView component
 */
export interface YearViewProps {
  year: number
  events: CalendarEvent[]
  onYearChange?: (year: number) => void
}

/**
 * Props for the MonthGrid component
 */
export interface MonthGridProps {
  year: number
  month: number // 0-11
  events: CalendarEvent[]
}

/**
 * Props for the DayCell component
 */
export interface DayCellProps {
  day: CalendarDay
}

/**
 * Props for the EventBar component
 */
export interface EventBarProps {
  event: LayoutEvent
  weekIndex: number
}

/**
 * Color mapping for Google Calendar color IDs
 */
export const EVENT_COLORS: Record<string, string> = {
  '1': '#7986cb', // Lavender
  '2': '#33b679', // Sage
  '3': '#8e24aa', // Grape
  '4': '#e67c73', // Flamingo
  '5': '#f6bf26', // Banana
  '6': '#f4511e', // Tangerine
  '7': '#039be5', // Peacock
  '8': '#616161', // Graphite
  '9': '#3f51b5', // Blueberry
  '10': '#0b8043', // Basil
  '11': '#d50000', // Tomato
  default: '#4285f4', // Default blue
}

