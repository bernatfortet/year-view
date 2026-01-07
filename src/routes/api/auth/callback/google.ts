import { createFileRoute } from '@tanstack/react-router'
import {
  exchangeCodeForTokens,
  fetchUserInfo,
  createSessionCookie,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  STATE_COOKIE_NAME,
} from '../../../../lib/auth'

export const Route = createFileRoute('/api/auth/callback/google')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const code = url.searchParams.get('code')
        const state = url.searchParams.get('state')
        const error = url.searchParams.get('error')

        // Handle errors from Google
        if (error) {
          console.error('OAuth error from Google:', error)
          return new Response(null, {
            status: 302,
            headers: {
              Location: '/?error=oauth_denied',
            },
          })
        }

        // Validate required parameters
        if (!code || !state) {
          return new Response(null, {
            status: 302,
            headers: {
              Location: '/?error=invalid_callback',
            },
          })
        }

        // Parse cookies to validate state
        const cookieHeader = request.headers.get('cookie') || ''
        const cookies = parseCookies(cookieHeader)
        const storedState = cookies[STATE_COOKIE_NAME]

        // Validate state to prevent CSRF
        if (!storedState || storedState !== state) {
          console.error('State mismatch:', { storedState, state })
          return new Response(null, {
            status: 302,
            headers: {
              Location: '/?error=invalid_state',
            },
          })
        }

        try {
          // Exchange the authorization code for tokens
          const { accessToken, refreshToken, expiresIn } = await exchangeCodeForTokens(code)

          // Fetch user info
          const userInfo = await fetchUserInfo(accessToken)

          // Create encrypted session cookie
          const sessionValue = createSessionCookie(
            accessToken,
            refreshToken,
            expiresIn,
            userInfo.email,
            userInfo.name
          )

          // Build session cookie string
          const sessionCookieParts = [
            `${SESSION_COOKIE_NAME}=${sessionValue}`,
            `Path=${SESSION_COOKIE_OPTIONS.path}`,
            `Max-Age=${SESSION_COOKIE_OPTIONS.maxAge}`,
            SESSION_COOKIE_OPTIONS.httpOnly ? 'HttpOnly' : '',
            SESSION_COOKIE_OPTIONS.sameSite ? `SameSite=${SESSION_COOKIE_OPTIONS.sameSite}` : '',
            SESSION_COOKIE_OPTIONS.secure ? 'Secure' : '',
          ]
            .filter(Boolean)
            .join('; ')

          // Clear the state cookie
          const clearStateCookie = `${STATE_COOKIE_NAME}=; Path=/; Max-Age=0`

          // Redirect to home with session cookie
          return new Response(null, {
            status: 302,
            headers: [
              ['Location', '/'],
              ['Set-Cookie', sessionCookieParts],
              ['Set-Cookie', clearStateCookie],
            ],
          })
        } catch (error) {
          console.error('OAuth callback error:', error)
          return new Response(null, {
            status: 302,
            headers: {
              Location: '/?error=auth_failed',
            },
          })
        }
      },
    },
  },
})

/**
 * Helper to parse cookies from header string
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}

  if (!cookieHeader) {
    return cookies
  }

  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=')
    const trimmedName = name?.trim()

    if (trimmedName) {
      cookies[trimmedName] = rest.join('=').trim()
    }
  })

  return cookies
}


