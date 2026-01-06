import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import {
  getAccessTokenFromRequest,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from '../../../lib/auth'
import type { CalendarEvent } from '../../../components/calendar/types'

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

interface GoogleCalendarEvent {
  id: string
  summary?: string
  description?: string
  start: {
    date?: string // All-day events have date
    dateTime?: string // Timed events have dateTime
  }
  end: {
    date?: string
    dateTime?: string
  }
  colorId?: string
  status: string
  htmlLink?: string
}

interface GoogleCalendarResponse {
  items: GoogleCalendarEvent[]
  nextPageToken?: string
}

interface CalendarInfo {
  id: string
  backgroundColor: string
}

export const Route = createFileRoute('/api/calendar/events')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const yearParam = url.searchParams.get('year')
        const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear()

        // Get calendar IDs to fetch (comma-separated)
        const calendarIdsParam = url.searchParams.get('calendarIds')
        const calendarIds = calendarIdsParam ? calendarIdsParam.split(',').filter(Boolean) : []

        // Get access token (will refresh if needed)
        const { accessToken, error, newSessionCookie } = await getAccessTokenFromRequest(request)

        if (!accessToken) {
          return json(
            { error: error || 'Not authenticated', events: [] },
            { status: 401 }
          )
        }

        try {
          // If no calendar IDs specified, return empty
          if (calendarIds.length === 0) {
            return json({ events: [], year })
          }

          // First, get calendar colors
          const calendarInfoMap = await fetchCalendarColors(accessToken, calendarIds)

          // Fetch events from all specified calendars
          const allEvents = await fetchEventsFromCalendars({
            accessToken,
            year,
            calendarIds,
            calendarInfoMap,
          })

          // Build response headers
          const headers: HeadersInit = {}

          // If token was refreshed, update the session cookie
          if (newSessionCookie) {
            const cookieParts = [
              `${SESSION_COOKIE_NAME}=${newSessionCookie}`,
              `Path=${SESSION_COOKIE_OPTIONS.path}`,
              `Max-Age=${SESSION_COOKIE_OPTIONS.maxAge}`,
              SESSION_COOKIE_OPTIONS.httpOnly ? 'HttpOnly' : '',
              SESSION_COOKIE_OPTIONS.sameSite ? `SameSite=${SESSION_COOKIE_OPTIONS.sameSite}` : '',
              SESSION_COOKIE_OPTIONS.secure ? 'Secure' : '',
            ]
              .filter(Boolean)
              .join('; ')

            headers['Set-Cookie'] = cookieParts
          }

          return json({ events: allEvents, year }, { headers })
        } catch (err) {
          console.error('🚨 Failed to fetch calendar events:', err)

          return json(
            { error: 'Failed to fetch calendar events', events: [] },
            { status: 500 }
          )
        }
      },
    },
  },
})

/**
 * Fetches calendar colors for the specified calendar IDs
 */
async function fetchCalendarColors(
  accessToken: string,
  calendarIds: string[]
): Promise<Map<string, CalendarInfo>> {
  const calendarInfoMap = new Map<string, CalendarInfo>()

  // Fetch each calendar's info to get its background color
  await Promise.all(
    calendarIds.map(async (calendarId) => {
      try {
        const response = await fetch(
          `${GOOGLE_CALENDAR_API}/users/me/calendarList/${encodeURIComponent(calendarId)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (response.ok) {
          const data = await response.json()

          calendarInfoMap.set(calendarId, {
            id: calendarId,
            backgroundColor: data.backgroundColor || '#4285f4',
          })
        }
      } catch (err) {
        console.error(`Failed to fetch calendar info for ${calendarId}:`, err)
      }
    })
  )

  return calendarInfoMap
}

/**
 * Fetches events from multiple calendars
 */
async function fetchEventsFromCalendars(params: {
  accessToken: string
  year: number
  calendarIds: string[]
  calendarInfoMap: Map<string, CalendarInfo>
}): Promise<CalendarEvent[]> {
  const { accessToken, year, calendarIds, calendarInfoMap } = params

  const allEvents: CalendarEvent[] = []

  // Fetch events from each calendar in parallel
  const results = await Promise.allSettled(
    calendarIds.map((calendarId) =>
      fetchAllDayEventsForCalendar({
        accessToken,
        year,
        calendarId,
        backgroundColor: calendarInfoMap.get(calendarId)?.backgroundColor || '#4285f4',
      })
    )
  )

  // Collect all successful results
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allEvents.push(...result.value)
    }
  }

  // Sort all events by start date
  allEvents.sort((a, b) => a.startDate.localeCompare(b.startDate))

  return allEvents
}

/**
 * Fetches all-day events from a specific calendar for a year
 */
async function fetchAllDayEventsForCalendar(params: {
  accessToken: string
  year: number
  calendarId: string
  backgroundColor: string
}): Promise<CalendarEvent[]> {
  const { accessToken, year, calendarId, backgroundColor } = params

  const timeMin = `${year}-01-01T00:00:00Z`
  const timeMax = `${year + 1}-01-01T00:00:00Z`

  const events: CalendarEvent[] = []
  let pageToken: string | undefined

  do {
    const searchParams = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '2500',
    })

    if (pageToken) {
      searchParams.set('pageToken', pageToken)
    }

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Google Calendar API error: ${response.status} - ${errorText}`)
    }

    const data: GoogleCalendarResponse = await response.json()

    // Filter to only all-day events
    const allDayEvents = data.items
      .filter((event) => event.start?.date && event.end?.date)
      .filter((event) => event.status !== 'cancelled')
      .map((event) => transformToCalendarEvent({
        googleEvent: event,
        calendarId,
        backgroundColor,
      }))

    events.push(...allDayEvents)
    pageToken = data.nextPageToken
  } while (pageToken)

  return events
}

/**
 * Transforms a Google Calendar event to our CalendarEvent format
 */
function transformToCalendarEvent(params: {
  googleEvent: GoogleCalendarEvent
  calendarId: string
  backgroundColor: string
}): CalendarEvent {
  const { googleEvent, calendarId, backgroundColor } = params

  return {
    id: googleEvent.id,
    summary: googleEvent.summary || '(No title)',
    description: googleEvent.description,
    startDate: googleEvent.start.date!,
    endDate: googleEvent.end.date!,
    colorId: googleEvent.colorId,
    status: googleEvent.status === 'tentative' ? 'tentative' : 'confirmed',
    calendarId,
    backgroundColor,
    htmlLink: googleEvent.htmlLink,
  }
}
