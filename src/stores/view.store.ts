import { atom } from 'nanostores'

export type ViewType = 'year' | 'trips'

/**
 * The currently active view in the main content area.
 * - 'year': Shows the year calendar grid
 * - 'trips': Shows the trips list view
 */
export const $activeView = atom<ViewType>('year')

export function setActiveView(view: ViewType) {
  $activeView.set(view)
}

