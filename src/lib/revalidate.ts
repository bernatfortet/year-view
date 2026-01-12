/**
 * Revalidates a specific page path, similar to Next.js's revalidatePath
 * 
 * By default, this also regenerates the page immediately so the next user sees fresh content.
 * 
 * @param regenerate - If true (default), immediately regenerates the page after purging cache.
 *                     If false, only marks as stale (next user request will trigger regeneration).
 */
export async function revalidatePath(params: {
  path: string
  secret: string
  regenerate?: boolean
}): Promise<{ revalidated: boolean; regenerated: boolean }> {
  const { path, secret, regenerate = true } = params

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || 'https://yeartrips.com'

  const response = await fetch(`${baseUrl}/api/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path, secret, regenerate }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`Failed to revalidate path: ${error.error || response.statusText}`)
  }

  return await response.json()
}

/**
 * Revalidates multiple page paths
 * 
 * @param regenerate - If true (default), immediately regenerates pages after purging cache.
 *                     If false, only marks as stale (next user request will trigger regeneration).
 */
export async function revalidatePaths(params: {
  paths: string[]
  secret: string
  regenerate?: boolean
}): Promise<{ revalidated: boolean; regenerated: boolean; successful: Array<{ path: string }> }> {
  const { paths, secret, regenerate = true } = params

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || 'https://yeartrips.com'

  const response = await fetch(`${baseUrl}/api/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paths, secret, regenerate }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`Failed to revalidate paths: ${error.error || response.statusText}`)
  }

  return await response.json()
}

/**
 * Revalidates pages by tag (similar to Next.js's revalidateTag)
 * 
 * Note: You'll need to maintain a tag->path mapping in your application
 * This is a placeholder - implement based on your needs
 * 
 * @param regenerate - If true (default), immediately regenerates pages after purging cache.
 *                     If false, only marks as stale (next user request will trigger regeneration).
 */
export async function revalidateTag(params: {
  tag: string
  secret: string
  regenerate?: boolean
  tagToPathsMap?: Map<string, string[]>
}): Promise<{ revalidated: boolean; regenerated: boolean }> {
  const { tag, secret, regenerate = true, tagToPathsMap } = params

  // If you have a tag->path mapping, use it
  // Otherwise, you'd need to implement this based on your routing structure
  if (tagToPathsMap) {
    const paths = tagToPathsMap.get(tag) || []
    if (paths.length === 0) {
      return { revalidated: false, regenerated: false }
    }

    const result = await revalidatePaths({ paths, secret, regenerate })
    return { revalidated: result.revalidated, regenerated: result.regenerated }
  }

  // Fallback: call the API with the tag
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || 'https://yeartrips.com'

  const response = await fetch(`${baseUrl}/api/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tag, secret, regenerate }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`Failed to revalidate tag: ${error.error || response.statusText}`)
  }

  return await response.json()
}
