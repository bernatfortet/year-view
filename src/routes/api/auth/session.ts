import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getSessionFromRequest } from '../../../lib/auth'

export const Route = createFileRoute('/api/auth/session')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const { user } = getSessionFromRequest(request)

        return json({
          user,
          isAuthenticated: !!user,
        })
      },
    },
  },
})
