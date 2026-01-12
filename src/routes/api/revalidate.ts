import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/revalidate')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { path, paths, tag, tags, secret, regenerate = true } = await request.json()

        if (secret !== process.env.REVALIDATE_SECRET) {
          return json({ error: 'Invalid token' }, { status: 401 })
        }

        // Support both path-based and tag-based revalidation
        const pathsToRevalidate: string[] = []

        if (paths) {
          pathsToRevalidate.push(...paths)
        } else if (path) {
          pathsToRevalidate.push(path)
        }

        if (tags || tag) {
          // If using tags, you'd need to maintain a tag->path mapping
          // For now, we'll just log that tags were requested
          console.log('🌀 Tag-based revalidation requested:', tags || tag)
        }

        if (pathsToRevalidate.length === 0) {
          return json({ error: 'No paths provided' }, { status: 400 })
        }

        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NEXT_PUBLIC_APP_URL || 'https://yeartrips.com'

        const revalidationResults = await Promise.allSettled(
          pathsToRevalidate.map(async (p) => {
            if (regenerate) {
              // First, purge the cache by making a no-cache request
              // Then immediately regenerate by making a normal request
              // This ensures the page is fresh before the next user visits
              
              // Step 1: Purge cache
              await fetch(`${baseUrl}${p}`, {
                method: 'GET',
                headers: {
                  'Cache-Control': 'no-cache',
                  'X-Revalidate': 'true',
                },
              })

              // Step 2: Regenerate immediately (this will be cached)
              const regenerateResponse = await fetch(`${baseUrl}${p}`, {
                method: 'GET',
                headers: {
                  'Cache-Control': 'public',
                  'X-Regenerate': 'true', // Custom header to identify regeneration requests
                },
              })

              if (!regenerateResponse.ok) {
                throw new Error(`Failed to regenerate ${p}: ${regenerateResponse.status}`)
              }

              return { path: p, status: 'regenerated' }
            } else {
              // Just mark as stale, don't regenerate yet
              const response = await fetch(`${baseUrl}${p}`, {
                method: 'GET',
                headers: {
                  'Cache-Control': 'no-cache',
                  'X-Revalidate': 'true',
                },
              })

              if (!response.ok) {
                throw new Error(`Failed to revalidate ${p}: ${response.status}`)
              }

              return { path: p, status: 'revalidated' }
            }
          })
        )

        const successful = revalidationResults
          .filter((r) => r.status === 'fulfilled')
          .map((r) => (r.status === 'fulfilled' ? r.value : null))
          .filter(Boolean)

        const failed = revalidationResults
          .filter((r) => r.status === 'rejected')
          .map((r) => (r.status === 'rejected' ? r.reason : null))
          .filter(Boolean)

        return json({
          revalidated: true,
          regenerated: regenerate,
          successful,
          failed: failed.length > 0 ? failed : undefined,
        })
      },
    },
  },
})
