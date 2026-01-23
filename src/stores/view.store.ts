import { atom } from 'nanostores'

export type ViewType = 'year' | 'linear' | 'trips'

const STORAGE_KEY = 'year-view:active-view'

/**
 * Load active view from localStorage
 */
function loadActiveView(): ViewType {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'year' || stored === 'linear' || stored === 'trips') {
      return stored
    }
    return 'year'
  } catch {
    return 'year'
  }
}

/**
 * The currently active view in the main content area.
 * - 'year': Shows the year calendar grid (grouped by month)
 * - 'linear': Shows continuous weeks without month grouping
 * - 'trips': Shows the trips list view
 */
export const $activeView = atom<ViewType>(typeof window !== 'undefined' ? loadActiveView() : 'year')

export function setActiveView(view: ViewType) {
  $activeView.set(view)
  try {
    localStorage.setItem(STORAGE_KEY, view)
  } catch {
    // Ignore storage errors
  }
}
