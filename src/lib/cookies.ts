import { createHmac, createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

/**
 * Encrypts data using AES-256-GCM with the session secret
 */
export function encrypt(data: string, secret: string): string {
  const key = createHmac('sha256', secret).update('encryption-key').digest()
  const iv = randomBytes(IV_LENGTH)

  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(data, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  const authTag = cipher.getAuthTag()

  // Combine IV + AuthTag + Encrypted data
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'base64'),
  ])

  return combined.toString('base64url')
}

/**
 * Decrypts data that was encrypted with the encrypt function
 */
export function decrypt(encryptedData: string, secret: string): string | null {
  try {
    const key = createHmac('sha256', secret).update('encryption-key').digest()
    const combined = Buffer.from(encryptedData, 'base64url')

    const iv = combined.subarray(0, IV_LENGTH)
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch {
    return null
  }
}

/**
 * Session data structure stored in the cookie
 */
export interface SessionData {
  accessToken: string
  refreshToken: string
  expiresAt: number
  userEmail?: string
  userName?: string
}

/**
 * Serializes and encrypts session data for storage in a cookie
 */
export function encryptSession(session: SessionData, secret: string): string {
  return encrypt(JSON.stringify(session), secret)
}

/**
 * Decrypts and deserializes session data from a cookie
 */
export function decryptSession(encryptedSession: string, secret: string): SessionData | null {
  const decrypted = decrypt(encryptedSession, secret)

  if (!decrypted) {
    return null
  }

  try {
    return JSON.parse(decrypted) as SessionData
  } catch {
    return null
  }
}

/**
 * Cookie options for the session cookie
 */
export const SESSION_COOKIE_NAME = 'year_view_session'

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
}

/**
 * Generates a random state parameter for CSRF protection
 */
export function generateState(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * State cookie name for CSRF protection during OAuth flow
 */
export const STATE_COOKIE_NAME = 'year_view_oauth_state'

export const STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 10, // 10 minutes
}

