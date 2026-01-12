# Revalidation Example - Next.js `revalidateTag` Equivalent

This shows how to recreate Next.js's `revalidateTag` behavior in TanStack Start.

## How It Works

1. **Set cache headers** on your route with `stale-while-revalidate`
2. **Call revalidation API** when content changes
3. **Next user request** triggers regeneration in background

## Example Route with Cache Headers

```typescript
// routes/blog/posts/$postId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/blog/posts/$postId')({
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId)
    return { post }
  },
  headers: () => ({
    // This enables stale-while-revalidate behavior:
    // - Cache for 1 hour (s-maxage)
    // - Serve stale content for up to 24 hours while regenerating
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  }),
})

export default function BlogPost() {
  const { post } = Route.useLoaderData()
  return <article>{/* ... */}</article>
}
```

## Revalidating After Content Update

### Option 1: Using the Helper Function (Server-Side)

```typescript
// In your CMS webhook or server function
import { revalidatePath } from '~/lib/revalidate'

// After updating a blog post
// By default, this regenerates immediately so next user sees fresh content
await revalidatePath({
  path: '/blog/posts/my-post',
  secret: process.env.REVALIDATE_SECRET!,
  regenerate: true, // default: true - regenerates immediately
})

// Or just mark as stale (next user request will trigger regeneration)
await revalidatePath({
  path: '/blog/posts/my-post',
  secret: process.env.REVALIDATE_SECRET!,
  regenerate: false, // Only marks as stale, doesn't regenerate yet
})
```

### Option 2: Direct API Call

```typescript
// From anywhere (client or server)
// Regenerate immediately (default)
await fetch('/api/revalidate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: '/blog/posts/my-post',
    secret: process.env.REVALIDATE_SECRET,
    regenerate: true, // default: true
  }),
})

// Or just mark as stale
await fetch('/api/revalidate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: '/blog/posts/my-post',
    secret: process.env.REVALIDATE_SECRET,
    regenerate: false,
  }),
})
```

### Option 3: Multiple Paths

```typescript
import { revalidatePaths } from '~/lib/revalidate'

// After updating a post, also revalidate the listing page
await revalidatePaths({
  paths: ['/blog/posts/my-post', '/blog'],
  secret: process.env.REVALIDATE_SECRET!,
})
```

## Behavior Comparison

### Next.js
```typescript
// In your API route or server action
revalidateTag('posts') // or revalidatePath('/blog/posts/my-post')
// Next request triggers regeneration
```

### TanStack Start
```typescript
// In your API route or server function
await revalidatePath({
  path: '/blog/posts/my-post',
  secret: process.env.REVALIDATE_SECRET!,
})
// Next request triggers regeneration
```

## What Happens

### With `regenerate: true` (default)

1. **You call revalidatePath**: 
   - Purges CDN cache for that page
   - Immediately regenerates the page
   - Fresh page is cached
2. **Next user request**: 
   - Served from fresh cache immediately ✅
   - No waiting for regeneration

### With `regenerate: false`

1. **You call revalidatePath**: Purges CDN cache for that page
2. **Next user request**: 
   - CDN cache miss → hits your server
   - Server regenerates the page
   - Fresh page is cached
3. **Subsequent requests**: Served from cache until next revalidation

## Environment Variables

Add to your `.env`:

```bash
REVALIDATE_SECRET=your-secret-token-here
```

## Vercel-Specific Notes

On Vercel, the revalidation works by:
1. Making a request with `Cache-Control: no-cache` header
2. This forces Vercel's Edge Network to mark the page as stale
3. Next real user request triggers regeneration

The `stale-while-revalidate` header ensures users get content immediately while regeneration happens in the background.
