import {
  encryptSession,
  decryptSession,
  generateState,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  STATE_COOKIE_NAME,
  STATE_COOKIE_OPTIONS,
  type SessionData,
} from './cookies'

// Google OAuth endpoints
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

// Required scopes for Google Calendar read access
const SCOPES = ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/calendar.readonly'].join(' ')

/**
 * Environment variable getters with validation
 */
function getEnvVar(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getGoogleClientId(): string {
  return getEnvVar('GOOGLE_CLIENT_ID')
}

function getGoogleClientSecret(): string {
  return getEnvVar('GOOGLE_CLIENT_SECRET')
}

function getGoogleRedirectUri(request: Request): string {
  // Dynamically determine from request origin
  // Normalize to non-www version to ensure consistency
  const url = new URL(request.url)
  let hostname = url.hostname

  // Remove www. prefix if present to normalize to canonical domain
  if (hostname.startsWith('www.')) {
    hostname = hostname.slice(4)
  }

  const protocol = url.protocol
  const origin = `${protocol}//${hostname}`
  const redirectUri = `${origin}/api/auth/callback/google`

  return redirectUri
}

function getSessionSecret(): string {
  return getEnvVar('SESSION_SECRET')
}

/**
 * Generates the Google OAuth authorization URL
 */
export function getGoogleAuthUrl(params: { state: string; request: Request }): string {
  const { state, request } = params
  const redirectUri = getGoogleRedirectUri(request)

  const urlParams = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    state,
    access_type: 'offline', // Required to get refresh token
    prompt: 'consent', // Force consent to always get refresh token
  })

  return `${GOOGLE_AUTH_URL}?${urlParams.toString()}`
}

/**
 * Token response from Google OAuth
 */
interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
  id_token?: string
}

/**
 * User info response from Google
 */
interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
}

/**
 * Exchanges an authorization code for access and refresh tokens
 */
export async function exchangeCodeForTokens(params: { code: string; request: Request }): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
}> {
  const { code, request } = params
  const redirectUri = getGoogleRedirectUri(request)

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code for tokens: ${error}`)
  }

  const data: GoogleTokenResponse = await response.json()

  if (!data.refresh_token) {
    throw new Error('No refresh token received. User may need to re-authorize.')
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  }
}

/**
 * Refreshes an access token using a refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string
  expiresIn: number
}> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh access token: ${error}`)
  }

  const data: GoogleTokenResponse = await response.json()

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  }
}

/**
 * Fetches user info from Google using an access token
 */
export async function fetchUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user info')
  }

  return response.json()
}

/**
 * Creates the session cookie value from tokens and user info
 */
export function createSessionCookie(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  userEmail?: string,
  userName?: string,
): string {
  const session: SessionData = {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
    userEmail,
    userName,
  }

  return encryptSession(session, getSessionSecret())
}

/**
 * Parses and validates a session from the cookie value
 * Returns null if session is invalid or expired
 */
export function parseSessionCookie(cookieValue: string): SessionData | null {
  return decryptSession(cookieValue, getSessionSecret())
}

/**
 * Checks if a session's access token is expired (with 5 minute buffer)
 */
export function isSessionExpired(session: SessionData): boolean {
  const bufferMs = 5 * 60 * 1000 // 5 minutes
  return Date.now() >= session.expiresAt - bufferMs
}

/**
 * Helper to parse cookies from header string
 */
export function parseCookies(cookieHeader: string): Record<string, string> {
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

/**
 * Gets the session from a request's cookies
 * Used in API route handlers
 */
export function getSessionFromRequest(request: Request): {
  session: SessionData | null
  user: { email: string; name: string } | null
} {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = parseCookies(cookieHeader)
  const sessionCookie = cookies[SESSION_COOKIE_NAME]

  if (!sessionCookie) {
    return { session: null, user: null }
  }

  const session = parseSessionCookie(sessionCookie)

  if (!session) {
    return { session: null, user: null }
  }

  const user = session.userEmail ? { email: session.userEmail, name: session.userName || '' } : null

  return { session, user }
}

/**
 * Gets the access token from a request, refreshing if needed
 * Returns the token and optionally a new session cookie if refreshed
 */
export async function getAccessTokenFromRequest(request: Request): Promise<{
  accessToken: string | null
  error?: string
  newSessionCookie?: string
}> {
  const { session } = getSessionFromRequest(request)

  if (!session) {
    return { accessToken: null, error: 'No session' }
  }

  // If token is not expired, return it
  if (!isSessionExpired(session)) {
    return { accessToken: session.accessToken }
  }

  // Try to refresh the token
  try {
    const { accessToken, expiresIn } = await refreshAccessToken(session.refreshToken)

    // Create new session cookie with refreshed token
    const newSessionCookie = createSessionCookie(accessToken, session.refreshToken, expiresIn, session.userEmail, session.userName)

    return { accessToken, newSessionCookie }
  } catch {
    return { accessToken: null, error: 'Failed to refresh token' }
  }
}

/**
 * Export cookie utilities for use in routes
 */
export { generateState, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS, STATE_COOKIE_NAME, STATE_COOKIE_OPTIONS }
