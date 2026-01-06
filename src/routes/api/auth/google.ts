import { createFileRoute } from '@tanstack/react-router'
import {
  getGoogleAuthUrl,
  generateState,
  STATE_COOKIE_NAME,
  STATE_COOKIE_OPTIONS,
} from '../../../lib/auth'

export const Route = createFileRoute('/api/auth/google')({
  server: {
    handlers: {
      GET: () => {
        // Generate a random state for CSRF protection
        const state = generateState()

        // Get the Google OAuth URL
        const authUrl = getGoogleAuthUrl(state)

        // Build cookie string
        const cookieParts = [
          `${STATE_COOKIE_NAME}=${state}`,
          `Path=${STATE_COOKIE_OPTIONS.path}`,
          `Max-Age=${STATE_COOKIE_OPTIONS.maxAge}`,
          STATE_COOKIE_OPTIONS.httpOnly ? 'HttpOnly' : '',
          STATE_COOKIE_OPTIONS.sameSite ? `SameSite=${STATE_COOKIE_OPTIONS.sameSite}` : '',
          STATE_COOKIE_OPTIONS.secure ? 'Secure' : '',
        ]
          .filter(Boolean)
          .join('; ')

        // Redirect to Google OAuth
        return new Response(null, {
          status: 302,
          headers: {
            Location: authUrl,
            'Set-Cookie': cookieParts,
          },
        })
      },
    },
  },
})
