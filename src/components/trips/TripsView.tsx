import { useMemo, useState, useEffect, useRef } from 'react'
import { Plane, PlaneLanding } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Row, Column } from '@/styles'

import type { CalendarEvent } from '../calendar/types'
import { filterAndEnrichTrips, getTripDisplayName, type Trip } from './trip-utils'
import { TripCard } from './TripCard'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

type TripFilter = 'upcoming' | 'past'

interface TripsViewProps {
  events: CalendarEvent[]
  year: number
}

export function TripsView(props: TripsViewProps) {
  const { events, year } = props

  const [filter, setFilter] = useState<TripFilter>('upcoming')
  const [activeId, setActiveId] = useState<string | null>(null)

  const allTrips = useMemo(() => filterAndEnrichTrips(events), [events])

  const { upcomingTrips, pastTrips } = useMemo(() => {
    return splitTripsByTime(allTrips)
  }, [allTrips])

  const displayedTrips = filter === 'upcoming' ? upcomingTrips : pastTrips

  // Set initial active ID when trips change
  useEffect(() => {
    if (displayedTrips.length > 0 && !activeId) {
      setActiveId(displayedTrips[0].id)
    }
  }, [displayedTrips, activeId])

  // Reset active ID when filter changes
  useEffect(() => {
    if (displayedTrips.length > 0) {
      setActiveId(displayedTrips[0].id)
    } else {
      setActiveId(null)
    }
  }, [filter])

  if (allTrips.length === 0) {
    return <EmptyState year={year} />
  }

  return (
    <Row className='max-w-4xl mx-auto px-4 py-8 gap-8'>
      {displayedTrips.length > 0 && (
        <TripTableOfContents trips={displayedTrips} activeId={activeId} onTripClick={scrollToTrip} />
      )}

      <Column className='flex-1 min-w-0'>
        <Row className='items-center justify-between mb-6'>
          <h2 className='text-xl font-bold text-primary'>Trips & Visits in {year}</h2>

          <TripFilterTabs filter={filter} onFilterChange={setFilter} upcomingCount={upcomingTrips.length} pastCount={pastTrips.length} />
        </Row>

        {displayedTrips.length === 0 ? (
          <NoTripsForFilter filter={filter} />
        ) : (
          <TripList trips={displayedTrips} onActiveChange={setActiveId} />
        )}
      </Column>
    </Row>
  )
}

interface TripTableOfContentsProps {
  trips: Trip[]
  activeId: string | null
  onTripClick: (id: string) => void
}

function TripTableOfContents(props: TripTableOfContentsProps) {
  const { trips, activeId, onTripClick } = props

  return (
    <nav className='sticky top-8 h-fit w-48 shrink-0 hidden lg:block'>
      <p className='text-xs font-medium text-tertiary uppercase tracking-wide mb-3'>On this page</p>
      <Column className='gap-1'>
        {trips.map((trip) => {
          const isActive = trip.id === activeId
          const displayName = getTripDisplayName(trip)

          return (
            <button
              key={trip.id}
              onClick={() => onTripClick(trip.id)}
              className={cn(
                'text-left text-sm px-2 py-1.5 rounded-md transition-colors truncate cursor-pointer',
                isActive ? 'bg-stone-100 text-black font-medium' : 'text-tertiary hover:text-black hover:bg-stone-50',
              )}
            >
              {displayName}
            </button>
          )
        })}
      </Column>
    </nav>
  )
}

interface TripListProps {
  trips: Trip[]
  onActiveChange: (id: string) => void
}

function TripList(props: TripListProps) {
  const { trips, onActiveChange } = props
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that is most visible
        const visibleEntries = entries.filter((entry) => entry.isIntersecting)
        if (visibleEntries.length === 0) return

        // Get the one with highest intersection ratio
        const mostVisible = visibleEntries.reduce((prev, current) =>
          current.intersectionRatio > prev.intersectionRatio ? current : prev,
        )

        const id = mostVisible.target.getAttribute('data-trip-id')
        if (id) onActiveChange(id)
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    const tripElements = container.querySelectorAll('[data-trip-id]')
    tripElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [trips, onActiveChange])

  return (
    <Column ref={containerRef} className='space-y-3'>
      {trips.map((trip) => (
        <div key={trip.id} id={`trip-${trip.id}`} data-trip-id={trip.id}>
          <TripCard trip={trip} />
        </div>
      ))}
    </Column>
  )
}

function scrollToTrip(id: string) {
  const element = document.getElementById(`trip-${id}`)
  if (!element) return

  const elementRect = element.getBoundingClientRect()
  const elementTop = elementRect.top + window.scrollY
  const elementHeight = elementRect.height
  const viewportHeight = window.innerHeight
  const targetScroll = elementTop - viewportHeight / 2 + elementHeight / 2

  const startScroll = window.scrollY
  const distance = targetScroll - startScroll
  const duration = 300
  let startTime: number | null = null

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  function animate(currentTime: number) {
    if (startTime === null) startTime = currentTime
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    window.scrollTo(0, startScroll + distance * easeInOutCubic(progress))

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

function TripFilterTabs(props: {
  filter: TripFilter
  onFilterChange: (filter: TripFilter) => void
  upcomingCount: number
  pastCount: number
}) {
  const { filter, onFilterChange, upcomingCount, pastCount } = props

  return (
    <Tabs value={filter} onValueChange={(value) => onFilterChange(value as TripFilter)}>
      <TabsList>
        <TabsTrigger value='upcoming'>Upcoming ({upcomingCount})</TabsTrigger>
        <TabsTrigger value='past'>Past ({pastCount})</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

function splitTripsByTime(trips: Trip[]): { upcomingTrips: Trip[]; pastTrips: Trip[] } {
  const upcomingTrips = trips.filter((trip) => !trip.isPast)
  const pastTrips = trips.filter((trip) => trip.isPast)

  return { upcomingTrips, pastTrips }
}

function NoTripsForFilter(props: { filter: TripFilter }) {
  const { filter } = props

  const message = filter === 'upcoming' ? 'No upcoming trips' : 'No past trips'

  return (
    <div className='text-center py-12 text-tertiary'>
      <p>{message}</p>
    </div>
  )
}

function EmptyState(props: { year: number }) {
  const { year } = props

  return (
    <Row className='items-center justify-center min-h-[60vh]'>
      <Column className='max-w-md mx-auto px-4'>
        <Row className='w-16 h-16 bg-stone-100 rounded-2xl items-center justify-center mx-auto mb-6'>
          <Plane className='w-6 h-6 text-tertiary' />
          <PlaneLanding className='w-6 h-6 text-tertiary ml-1' />
        </Row>

        <h2 className='text-xl font-semibold mb-3 text-center'>No Trips or Visits Found</h2>

        <Column className='gap-3 text-sm text-tertiary'>
          <p>Events with "Trip" in the title or starting with "Visit:" appear here, organized by upcoming and past.</p>

          <div className='bg-stone-50 rounded-md px-3 py-2 space-y-1'>
            <div>
              <span className='text-tertiary'>Trip example:</span> <span className='font-medium text-primary'>Trip to Japan</span>
            </div>
            <div>
              <span className='text-tertiary'>Visit example:</span> <span className='font-medium text-primary'>Visit: Mom & Dad</span>
            </div>
          </div>

          <p>
            Both have three states: with "?" shows "Needs planning", with a description shows flight/travel info, without either shows
            "Needs info".
          </p>

          <p className='text-xs'>Add flight details in the event description to see them rendered.</p>
        </Column>
      </Column>
    </Row>
  )
}
