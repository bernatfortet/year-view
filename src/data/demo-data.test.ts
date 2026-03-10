import { describe, expect, it } from 'vitest'

import { filterAndEnrichTrips } from '@/components/trips/trip-utils'
import { extractGmailLink } from '@/components/trips/trip-description'

import { demoEvents } from './demo-data'

describe('demoEvents', () => {
  it('covers the main trip states and visit scenarios used in the demo', () => {
    const trips = filterAndEnrichTrips(demoEvents)

    expect(trips.some((trip) => trip.tripStatus === 'todo' && trip.summary === 'Kyoto Spring Break Trip?')).toBe(true)
    expect(trips.some((trip) => trip.tripStatus === 'pending' && trip.summary === 'Montreal Grand Prix Trip')).toBe(true)
    expect(trips.filter((trip) => trip.isVisit)).toHaveLength(2)
    expect(trips.filter((trip) => trip.tripStatus === 'has-info').length).toBeGreaterThanOrEqual(6)
  })

  it('includes gmail-linked travel bookings and a strong April showcase month', () => {
    const eventIds = new Set(demoEvents.map((event) => event.id))
    const gmailLinkedTrips = demoEvents.filter((event) => extractGmailLink(event.description) !== null)

    expect(gmailLinkedTrips.map((event) => event.id)).toEqual(
      expect.arrayContaining(['visit-genevieve-costa-rica', 'trip-austin-wedding']),
    )

    expect(eventIds.has('holiday-easter')).toBe(true)
    expect(eventIds.has('school-spring-break')).toBe(true)
    expect(eventIds.has('tentative-spring-break-trip')).toBe(true)
    expect(eventIds.has('family-abuela-birthday')).toBe(true)
    expect(eventIds.has('work-design-sprint')).toBe(true)
  })
})
