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
  calendarId: string // ID of the calendar this event belongs to
  backgroundColor?: string // Color from the calendar
  htmlLink?: string // Link to view/edit the event in Google Calendar
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
  daySize?: number
}

/**
 * Props for the MonthGrid component
 */
export interface MonthGridProps {
  year: number
  month: number // 0-11
  events: CalendarEvent[]
  daySize: number
}

/**
 * Props for the DayCell component
 */
export interface DayCellProps {
  day: CalendarDay
  size: number
  hasTentativeEvent?: boolean
  birthdayEvents?: CalendarEvent[]
}

/**
 * Props for the EventBar component
 */
export interface EventBarProps {
  event: LayoutEvent
}

/**
 * Color mapping for Google Calendar color IDs (background/pastel versions)
 */
export const EVENT_COLORS: Record<string, string> = {
  '1': '#a4bdfc', // Lavender
  '2': '#7ae7bf', // Sage
  '3': '#dbadff', // Grape
  '4': '#ff887c', // Flamingo
  '5': '#fbd75b', // Banana
  '6': '#ffb878', // Tangerine
  '7': '#46d6db', // Peacock
  '8': '#e1e1e1', // Graphite
  '9': '#5484ed', // Blueberry
  '10': '#51b749', // Basil
  '11': '#dc2127', // Tomato
  default: '#a4bdfc', // Default lavender
}
