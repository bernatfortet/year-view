import { atom } from 'nanostores'

export type ViewType = 'year' | 'linear' | 'trips'

/**
 * The currently active view in the main content area.
 * - 'year': Shows the year calendar grid (grouped by month)
 * - 'linear': Shows continuous weeks without month grouping
 * - 'trips': Shows the trips list view
 */
export const $activeView = atom<ViewType>('year')

export function setActiveView(view: ViewType) {
  $activeView.set(view)
}
