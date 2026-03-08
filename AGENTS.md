# AGENTS.md

## Cursor Cloud specific instructions

### Overview

YearTrips is a year-view calendar web app (TanStack Start + React 19 + Vite 7 + Nitro). It integrates with Google Calendar via OAuth and has an optional AI flight parser (Gemini). No database — all event data comes from Google Calendar API; settings live in browser `localStorage`.

### Package manager

Use **bun** (lockfile: `bun.lock`). See `package.json` for available scripts.

### Environment variables

Copy `.env.example` to `.env`. Required: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`. The app starts without valid Google credentials but OAuth login will fail. Generate `SESSION_SECRET` with `openssl rand -base64 24 | tr -d '/+=' | head -c 32`.

### Dev / Build / Test commands

Documented in `package.json` scripts section. Key commands:
- `bun run dev` — dev server on port 3000
- `bun run build` — production build
- `bun run test` — vitest (no test files exist yet; the command exits with code 1 when there are no tests)

### Linting

No ESLint or Biome config. TypeScript strict mode (`tsc --noEmit`) serves as the primary static check. Note: `src/components/grain.tsx` contains raw HTML (not valid JSX) and will cause tsc errors — it is not imported by application code (the actual grain component is `GrainOverlay.tsx`).

### Gotchas

- The dev server uses Nitro under the hood. Hot reload works for both client and server code without restart.
- The `/try-demo` route works without Google OAuth credentials — use it for testing UI changes.
- Bun must be on PATH. After initial install (`curl -fsSL https://bun.sh/install | bash`), source `~/.bashrc` or add `$HOME/.bun/bin` to PATH.
