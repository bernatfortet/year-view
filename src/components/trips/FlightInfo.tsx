import { Plane, Clock } from 'lucide-react'

import { Row, Column } from '@/styles'

interface FlightInfoProps {
  description: string
}

interface ParsedFlight {
  flightNumber?: string
  airline?: string
  departureCity?: string
  departureCode?: string
  departureTime?: string
  departureDate?: string
  arrivalCity?: string
  arrivalCode?: string
  arrivalTime?: string
  arrivalDate?: string
}

interface ParsedFlightSection {
  label: string
  flights: ParsedFlight[]
}

interface ParsedFlights {
  confirmation?: string
  outbound: ParsedFlight[]
  return: ParsedFlight[]
}

export function FlightInfo(props: FlightInfoProps) {
  const { description } = props

  const parsed = parseAllFlights(description)

  // No flights parsed at all - show raw description
  if (parsed.outbound.length === 0 && parsed.return.length === 0) {
    return <RawDescription description={description} />
  }

  const hasOutbound = parsed.outbound.length > 0
  const hasReturn = parsed.return.length > 0

  return (
    <Column className='mt-3 gap-2'>
      {parsed.confirmation && <ConfirmationBadge code={parsed.confirmation} />}

      {hasOutbound && <FlightSection label='Outbound' flights={parsed.outbound} />}
      {!hasOutbound && hasReturn && <PendingFlightCard label='Outbound' />}

      {hasReturn && <FlightSection label='Return' flights={parsed.return} />}
      {hasOutbound && !hasReturn && <PendingFlightCard label='Return' />}
    </Column>
  )
}

function ConfirmationBadge(props: { code: string }) {
  const { code } = props

  return (
    <Row className='items-center gap-2 text-xs text-tertiary'>
      <span className='font-medium'>Confirmation:</span>
      <span className='font-mono bg-stone-100 px-1.5 py-0.5 rounded'>{code}</span>
    </Row>
  )
}

function FlightSection(props: { label: string; flights: ParsedFlight[] }) {
  const { label, flights } = props

  // For connecting flights, show a combined card
  if (flights.length > 1) {
    return <ConnectingFlightsCard label={label} flights={flights} />
  }

  // Single flight
  return <FlightCard label={label} flight={flights[0]} />
}

function FlightCard(props: { label: string; flight: ParsedFlight }) {
  const { label, flight } = props

  return (
    <div className='rounded-lg border bg-stone-50 p-3'>
      <div className='text-xs font-medium text-tertiary mb-1'>{label}</div>
      <FlightRoute flight={flight} />
      <FlightTimes flight={flight} />
    </div>
  )
}

function ConnectingFlightsCard(props: { label: string; flights: ParsedFlight[] }) {
  const { label, flights } = props

  const firstFlight = flights[0]
  const lastFlight = flights[flights.length - 1]

  // Summary: origin → final destination
  const originCity = firstFlight.departureCity || firstFlight.departureCode || '?'
  const destinationCity = lastFlight.arrivalCity || lastFlight.arrivalCode || '?'
  const connectionCount = flights.length - 1

  return (
    <div className='rounded-lg border bg-stone-50 p-3'>
      <div className='text-xs font-medium text-tertiary mb-1'>{label}</div>

      {/* Summary header */}
      <Row className='items-center justify-between mb-3'>
        <span className='text-base font-semibold text-primary'>
          {originCity} to {destinationCity}
        </span>
        <span className='text-xs text-tertiary'>
          {connectionCount} {connectionCount === 1 ? 'connection' : 'connections'}
        </span>
      </Row>

      {/* Individual legs */}
      <Column className='gap-2 border-t border-stone-200 pt-2'>
        {flights.map((flight, index) => (
          <FlightLeg key={index} flight={flight} isLast={index === flights.length - 1} />
        ))}
      </Column>
    </div>
  )
}

function FlightLeg(props: { flight: ParsedFlight; isLast: boolean }) {
  const { flight, isLast } = props

  const departureDisplay = flight.departureCity || flight.departureCode || '?'
  const arrivalDisplay = flight.arrivalCity || flight.arrivalCode || '?'
  const hasFlightNumber = flight.airline && flight.flightNumber

  return (
    <Row className={`items-center gap-3 text-sm ${!isLast ? 'pb-2 border-b border-dashed border-stone-200' : ''}`}>
      {hasFlightNumber && (
        <Row className='items-center gap-1 text-tertiary min-w-[60px]'>
          <Plane className='size-3' />
          <span className='font-mono text-xs'>
            {flight.airline} {flight.flightNumber}
          </span>
        </Row>
      )}

      <Row className='items-center gap-2 flex-1'>
        <span className='font-medium text-primary'>{departureDisplay}</span>
        {flight.departureTime && <span className='text-tertiary'>{flight.departureTime}</span>}
        <span className='text-tertiary'>→</span>
        <span className='font-medium text-primary'>{arrivalDisplay}</span>
        {flight.arrivalTime && <span className='text-tertiary'>{flight.arrivalTime}</span>}
      </Row>
    </Row>
  )
}

function PendingFlightCard(props: { label: string }) {
  const { label } = props

  return (
    <div className='rounded-lg border border-dashed border-stone-300 bg-stone-50/50 p-3'>
      <div className='text-xs font-medium text-tertiary mb-1'>{label}</div>
      <Row className='items-center gap-2 text-sm text-tertiary'>
        <Clock className='size-4' />
        <span>Pending</span>
      </Row>
    </div>
  )
}

function FlightRoute(props: { flight: ParsedFlight }) {
  const { flight } = props

  const departureDisplay = flight.departureCity || flight.departureCode
  const arrivalDisplay = flight.arrivalCity || flight.arrivalCode
  const hasRoute = departureDisplay || arrivalDisplay
  const hasFlightNumber = flight.airline && flight.flightNumber

  return (
    <Row className='items-center justify-between mb-2'>
      {hasRoute && (
        <span className='text-base font-semibold text-primary'>
          {departureDisplay || '?'} to {arrivalDisplay || '?'}
        </span>
      )}
      {hasFlightNumber && (
        <Row className='items-center gap-1.5 text-sm text-tertiary'>
          <Plane className='size-3.5' />
          <span>
            {flight.airline} {flight.flightNumber}
          </span>
        </Row>
      )}
    </Row>
  )
}

function FlightTimes(props: { flight: ParsedFlight }) {
  const { flight } = props

  const hasDeparture = flight.departureCode && flight.departureTime
  const hasArrival = flight.arrivalCode && flight.arrivalTime

  if (!hasDeparture && !hasArrival) return null

  const departureDisplay = flight.departureDate ? `${flight.departureTime}, ${flight.departureDate}` : flight.departureTime
  const arrivalDisplay = flight.arrivalDate ? `${flight.arrivalTime}, ${flight.arrivalDate}` : flight.arrivalTime

  return (
    <Row className='items-center gap-6 text-sm'>
      {hasDeparture && (
        <Row className='items-center gap-2'>
          <div className='rounded-full bg-stone-800 p-1'>
            <svg className='size-2.5 text-white' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
              <path d='M7 17L17 7M17 7H7M17 7V17' />
            </svg>
          </div>
          <span className='text-tertiary'>{flight.departureCode}</span>
          <span className='font-medium text-primary'>{departureDisplay}</span>
        </Row>
      )}

      {hasArrival && (
        <Row className='items-center gap-2'>
          <div className='rounded-full bg-stone-800 p-1'>
            <svg className='size-2.5 text-white' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
              <path d='M7 7L17 17M17 17H7M17 17V7' />
            </svg>
          </div>
          <span className='text-tertiary'>{flight.arrivalCode}</span>
          <span className='font-medium text-primary'>{arrivalDisplay}</span>
        </Row>
      )}
    </Row>
  )
}

function RawDescription(props: { description: string }) {
  const { description } = props

  const sanitized = sanitizeHtml(description)

  return (
    <div className='mt-3 rounded-lg border bg-stone-50 p-3 text-sm text-tertiary whitespace-pre-line'>
      {sanitized}
    </div>
  )
}

/**
 * Sanitizes HTML content from Google Calendar descriptions.
 * - Converts <br> and <br/> to newlines
 * - Extracts text from <a> tags (keeps the link text or href)
 * - Strips all other HTML tags
 */
function sanitizeHtml(html: string): string {
  let text = html

  // Convert <br>, <br/>, <br /> to newlines
  text = text.replace(/<br\s*\/?>/gi, '\n')

  // Extract href from <a> tags and keep as plain text
  text = text.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi, (_, href, linkText) => {
    // If link text is same as href or empty, just show href
    const trimmedText = linkText.trim()
    if (!trimmedText || trimmedText === href) return href
    return `${trimmedText} (${href})`
  })

  // Strip any remaining HTML tags
  text = text.replace(/<[^>]*>/g, '')

  // Decode common HTML entities
  text = text.replace(/&nbsp;/gi, ' ')
  text = text.replace(/&amp;/gi, '&')
  text = text.replace(/&lt;/gi, '<')
  text = text.replace(/&gt;/gi, '>')
  text = text.replace(/&quot;/gi, '"')
  text = text.replace(/&#39;/gi, "'")

  return text.trim()
}

/**
 * Parses all flights from description, handling:
 * - Multiple flights per section (connecting flights)
 * - Confirmation codes
 * - Various formats
 */
function parseAllFlights(rawDescription: string): ParsedFlights {
  const description = sanitizeHtml(rawDescription)

  const result: ParsedFlights = {
    outbound: [],
    return: [],
    confirmation: undefined,
  }

  // Extract confirmation code(s)
  const confirmationMatch = description.match(/confirmation[:\s]+([A-Z0-9]{5,8}(?:\s*[\/,]\s*[A-Z0-9]{5,8})*)/i)
  if (confirmationMatch) {
    result.confirmation = confirmationMatch[1].trim()
  }

  // Split by section labels (Outbound:, Return:)
  const sections = description.split(/\n(?=(outbound|return):\s*\n?)/i)

  for (const section of sections) {
    const sectionLower = section.toLowerCase().trim()

    if (sectionLower.startsWith('outbound')) {
      const flights = parseFlightsFromSection(section)
      result.outbound.push(...flights)
    } else if (sectionLower.startsWith('return')) {
      const flights = parseFlightsFromSection(section)
      result.return.push(...flights)
    }
  }

  // If no labeled sections found, try parsing entire description as outbound
  if (result.outbound.length === 0 && result.return.length === 0) {
    const flights = parseFlightsFromSection(description)
    result.outbound.push(...flights)
  }

  return result
}

/**
 * Parses multiple flights from a section. Handles formats like:
 *
 * Flight: AA 1149
 * Departure: Austin AUS 4:29pm, Mar 22
 * Arrival: Dallas-Ft. Worth DFW 5:49pm, Mar 22
 * Flight: AA 1453
 * Departure: Dallas-Ft. Worth DFW 6:38pm, Mar 22
 * Arrival: San Jose SJO 9:43pm, Mar 22
 *
 * Also handles partial info (missing departure or arrival)
 */
function parseFlightsFromSection(section: string): ParsedFlight[] {
  const flights: ParsedFlight[] = []
  const lines = section.split('\n').map((line) => line.trim()).filter(Boolean)

  let currentFlightLine: string | undefined
  let currentDepartureLine: string | undefined
  let currentArrivalLine: string | undefined

  function saveCurrentFlight() {
    // Save if we have at least some useful info
    if (currentFlightLine || currentDepartureLine || currentArrivalLine) {
      const flight = buildFlight(currentFlightLine, currentDepartureLine, currentArrivalLine)
      if (flight) flights.push(flight)
    }
  }

  for (const line of lines) {
    const lineLower = line.toLowerCase()

    // Skip section headers
    if (lineLower === 'outbound:' || lineLower === 'return:') continue

    if (lineLower.startsWith('flight:')) {
      // Save previous flight before starting new one
      saveCurrentFlight()

      // Start new flight
      currentFlightLine = line
      currentDepartureLine = undefined
      currentArrivalLine = undefined
    } else if (lineLower.startsWith('departure:')) {
      currentDepartureLine = line
    } else if (lineLower.startsWith('arrival:')) {
      currentArrivalLine = line
    }
  }

  // Don't forget the last flight
  saveCurrentFlight()

  return flights
}

function buildFlight(flightLine?: string, departureLine?: string, arrivalLine?: string): ParsedFlight | null {
  const flightInfo = flightLine ? parseFlightLine(flightLine) : null
  const departure = departureLine ? parseLocationLine(departureLine) : null
  const arrival = arrivalLine ? parseLocationLine(arrivalLine) : null

  // Need at least flight info OR departure OR arrival to show anything
  if (!flightInfo && !departure && !arrival) return null

  return {
    airline: flightInfo?.airline,
    flightNumber: flightInfo?.flightNumber,
    departureCity: departure?.city,
    departureCode: departure?.code,
    departureTime: departure?.time,
    departureDate: departure?.date,
    arrivalCity: arrival?.city,
    arrivalCode: arrival?.code,
    arrivalTime: arrival?.time,
    arrivalDate: arrival?.date,
  }
}

/**
 * Parses "Flight: UA 2312" or "Flight: AA 1149" into airline and flight number
 */
function parseFlightLine(line: string): { airline: string; flightNumber: string } | null {
  const match = line.match(/flight:\s*([A-Z]{2})\s*(\d+)/i)
  if (!match) return null

  return {
    airline: match[1].toUpperCase(),
    flightNumber: match[2],
  }
}

/**
 * Parses location lines in multiple formats:
 * - Full: "Departure: San Francisco SFO 12:05am, Dec 19"
 * - With parens: "Departure: Dallas-Ft. Worth DFW 5:49pm, Mar 22"
 * - Short: "Departure: SJO 5pm, Feb 15"
 */
function parseLocationLine(line: string): { city: string; code: string; time: string; date?: string } | null {
  // Remove the prefix (Departure: or Arrival:)
  const content = line.replace(/^(departure|arrival):\s*/i, '').trim()

  // Try full format: "City Name CODE TIME, DATE"
  // City can have special chars like hyphens, dots, commas in name
  const fullMatch = content.match(/^(.+?)\s+([A-Z]{3})\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)),?\s*([A-Z][a-z]{2}\s+\d{1,2})?/i)

  if (fullMatch) {
    return {
      city: fullMatch[1].trim(),
      code: fullMatch[2].toUpperCase(),
      time: fullMatch[3].toLowerCase().replace(/\s+/g, ''),
      date: fullMatch[4]?.trim(),
    }
  }

  // Try short format: "CODE TIME, DATE" (no city name)
  const shortMatch = content.match(/^([A-Z]{3})\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)),?\s*([A-Z][a-z]{2}\s+\d{1,2})?/i)

  if (shortMatch) {
    return {
      city: '',
      code: shortMatch[1].toUpperCase(),
      time: shortMatch[2].toLowerCase().replace(/\s+/g, ''),
      date: shortMatch[3]?.trim(),
    }
  }

  return null
}

