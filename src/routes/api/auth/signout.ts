import { createFileRoute } from '@tanstack/react-router'
import { SESSION_COOKIE_NAME, STATE_COOKIE_NAME } from '../../../lib/auth'

export const Route = createFileRoute('/api/auth/signout')({
  server: {
    handlers: {
      GET: () => {
        // Clear the session cookie
        const clearSessionCookie = `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly`

        // Also clear any lingering state cookie
        const clearStateCookie = `${STATE_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly`

        // Redirect to home
        return new Response(null, {
          status: 302,
          headers: [
            ['Location', '/'],
            ['Set-Cookie', clearSessionCookie],
            ['Set-Cookie', clearStateCookie],
          ],
        })
      },

      POST: () => {
        // Also support POST for form submissions
        const clearSessionCookie = `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly`
        const clearStateCookie = `${STATE_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly`

        return new Response(null, {
          status: 302,
          headers: [
            ['Location', '/'],
            ['Set-Cookie', clearSessionCookie],
            ['Set-Cookie', clearStateCookie],
          ],
        })
      },
    },
  },
})

