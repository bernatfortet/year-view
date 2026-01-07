import { atom } from 'nanostores'

const STORAGE_KEY = 'year-view:settings:excludeTerms'

/**
 * Load exclude terms from localStorage
 */
function loadExcludeTerms(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []

    return parsed
  } catch {
    return []
  }
}

/**
 * Save exclude terms to localStorage
 */
function saveExcludeTerms(terms: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(terms))
  } catch (error) {
    console.warn('🚨 Failed to save exclude terms:', error)
  }
}

/**
 * Atom storing the list of terms to exclude from event display.
 * Events whose summary contains any of these terms (case-insensitive) will be hidden.
 */
export const $excludeTerms = atom<string[]>(loadExcludeTerms())

/**
 * Set the exclude terms list.
 * Parses a comma-separated string, trims whitespace, and filters empty strings.
 */
export function setExcludeTermsFromInput(input: string) {
  const terms = input
    .split(',')
    .map((term) => term.trim())
    .filter((term) => term.length > 0)

  $excludeTerms.set(terms)
  saveExcludeTerms(terms)
}

/**
 * Clear all exclude terms
 */
export function clearExcludeTerms() {
  $excludeTerms.set([])
  saveExcludeTerms([])
}

