import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import {
  getAccessTokenFromRequest,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from '../../../lib/auth'

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

export interface GoogleCalendar {
  id: string
  summary: string
  description?: string
  backgroundColor: string
  foregroundColor: string
  accessRole: 'owner' | 'writer' | 'reader' | 'freeBusyReader'
  primary?: boolean
  selected?: boolean
}

interface GoogleCalendarListResponse {
  kind: string
  etag: string
  nextPageToken?: string
  items: GoogleCalendar[]
}

export const Route = createFileRoute('/api/calendar/list')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Get access token (will refresh if needed)
        const { accessToken, error, newSessionCookie } = await getAccessTokenFromRequest(request)

        if (!accessToken) {
          return json(
            { error: error || 'Not authenticated', calendars: [] },
            { status: 401 }
          )
        }

        try {
          // Fetch the user's calendar list
          const calendars = await fetchCalendarList(accessToken)

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

          return json({ calendars }, { headers })
        } catch (err) {
          console.error('Failed to fetch calendar list:', err)

          return json(
            { error: 'Failed to fetch calendar list', calendars: [] },
            { status: 500 }
          )
        }
      },
    },
  },
})

/**
 * Fetches the user's calendar list from Google Calendar API
 */
async function fetchCalendarList(accessToken: string): Promise<GoogleCalendar[]> {
  const allCalendars: GoogleCalendar[] = []
  let pageToken: string | undefined

  do {
    const params = new URLSearchParams({
      minAccessRole: 'reader',
      showDeleted: 'false',
      showHidden: 'false',
    })

    if (pageToken) {
      params.set('pageToken', pageToken)
    }

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/users/me/calendarList?${params.toString()}`,
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

    const data: GoogleCalendarListResponse = await response.json()

    // Transform and add calendars
    const calendars = data.items.map((calendar) => ({
      id: calendar.id,
      summary: calendar.summary,
      description: calendar.description,
      backgroundColor: calendar.backgroundColor,
      foregroundColor: calendar.foregroundColor,
      accessRole: calendar.accessRole,
      primary: calendar.primary,
      selected: calendar.selected,
    }))

    allCalendars.push(...calendars)
    pageToken = data.nextPageToken
  } while (pageToken)

  // Sort: primary first, then by summary alphabetically
  return allCalendars.sort((a, b) => {
    if (a.primary) return -1
    if (b.primary) return 1

    return a.summary.localeCompare(b.summary)
  })
}
