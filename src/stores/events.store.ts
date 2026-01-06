import { atom } from 'nanostores'

/**
 * A counter that triggers event refresh when incremented.
 * Components can listen to this and refetch when the value changes.
 */
export const $eventsRefreshTrigger = atom(0)

/**
 * Whether events are currently being synced from Google Calendar.
 * This is the "long" request that takes a few seconds.
 */
export const $isSyncingEvents = atom(false)

/**
 * Call this to trigger a refresh of calendar events
 */
export function triggerEventsRefresh() {
  $eventsRefreshTrigger.set($eventsRefreshTrigger.get() + 1)
}

