# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

YearTrips is a year-view calendar app (TanStack Start + React 19 + Vite 7 + Bun). It connects to Google Calendar to display all-day events across a year. A demo mode at `/try-demo` works without Google OAuth credentials.

### Running the app

- `bun run dev` starts the dev server on port 3000 (see `package.json` for all scripts).
- The app requires a `.env` file — copy `.env.example` and fill in values. For development without Google OAuth, use placeholder values; the demo mode (`/try-demo`) still works.
- `SESSION_SECRET` must be a 32-char random string: `openssl rand -base64 24 | tr -d '/+=' | head -c 32`.

### Testing

- `bun run test` runs Vitest. Tests exit cleanly but may print a "hanging-process" warning from Vite — this is benign.

### TypeScript

- `npx tsc --noEmit` runs type checking. There is a pre-existing TS error in `src/components/grain.tsx` (raw HTML stored as `.tsx`). This does not affect the build or runtime.

### Key routes

| Route | Description |
|-------|-------------|
| `/home` | Landing page |
| `/try-demo` | Demo mode (no auth needed) |
| `/` | Authenticated calendar view |

### No external services required

No database, Docker, or background workers. All data comes from Google Calendar API (or demo data in demo mode).
