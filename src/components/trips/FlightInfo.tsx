import { Plane, Clock, Car, Hotel } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Row, Column } from '@/styles'

interface FlightInfoProps {
  description: string
  className?: string
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
  const { description, className } = props

  const sanitizedDescription = sanitizeHtml(description)
  const { details: hotelDetails, remainingDescription: descriptionWithoutHotel } = extractLabeledSection({
    description: sanitizedDescription,
    label: 'Hotel',
  })
  const { details: carDetails, remainingDescription } = extractLabeledSection({
    description: descriptionWithoutHotel,
    label: 'Car Rental',
  })
  const parsed = parseAllFlightsFromSanitized(remainingDescription)
  const hasRemainingDescription = remainingDescription.trim().length > 0

  // No flights parsed at all - show raw description
  if (parsed.outbound.length === 0 && parsed.return.length === 0) {
    return (
      <Column className={cn('mt-3 gap-2', className)}>
        {hasRemainingDescription && <RawDescription description={remainingDescription} />}
        {hotelDetails && <DetailsSection label='Hotel' icon={Hotel} details={hotelDetails} />}
        {carDetails && <DetailsSection label='Car Rental' icon={Car} details={carDetails} />}
      </Column>
    )
  }

  const hasOutbound = parsed.outbound.length > 0
  const hasReturn = parsed.return.length > 0

  // Get relative time from the first flight's departure date in each section
  const outboundDate = parsed.outbound[0]?.departureDate
  const returnDate = parsed.return[0]?.departureDate
  const outboundRelative = outboundDate ? getRelativeTimeLabelFromShortDate(outboundDate) : null
  const returnRelative = returnDate ? getRelativeTimeLabelFromShortDate(returnDate) : null

  return (
    <Column className={cn('mt-3 gap-2', className)}>
      {parsed.confirmation && <ConfirmationBadge code={parsed.confirmation} />}

      {hasOutbound && <FlightSection label='Outbound' flights={parsed.outbound} relativeTime={outboundRelative} />}
      {!hasOutbound && hasReturn && <PendingFlightCard label='Outbound' relativeTime={null} />}

      {hasReturn && <FlightSection label='Return' flights={parsed.return} relativeTime={returnRelative} />}
      {hasOutbound && !hasReturn && <PendingFlightCard label='Return' relativeTime={null} />}

      {hotelDetails && <DetailsSection label='Hotel' icon={Hotel} details={hotelDetails} />}
      {carDetails && <DetailsSection label='Car Rental' icon={Car} details={carDetails} />}
    </Column>
  )
}

type IconComponent = (props: { className?: string }) => JSX.Element

function DetailsSection(props: { label: string; icon: IconComponent; details: string }) {
  const { label, icon: Icon, details } = props

  return (
    <div className='rounded-lg border bg-stone-50 p-3 text-sm text-tertiary whitespace-pre-line'>
      <Row className='items-center gap-2 mb-1 text-xs font-medium text-tertiary'>
        <Icon className='size-3.5' />
        <span>{label}</span>
      </Row>
      <Linkify text={details} />
    </div>
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

function FlightSection(props: { label: string; flights: ParsedFlight[]; relativeTime: string | null }) {
  const { label, flights, relativeTime } = props

  // For connecting flights, show a combined card
  if (flights.length > 1) {
    return <ConnectingFlightsCard label={label} flights={flights} relativeTime={relativeTime} />
  }

  // Single flight
  return <FlightCard label={label} flight={flights[0]} relativeTime={relativeTime} />
}

function FlightCard(props: { label: string; flight: ParsedFlight; relativeTime: string | null }) {
  const { label, flight, relativeTime } = props

  return (
    <div className='rounded-lg border bg-stone-50 p-3'>
      <FlightSectionLabel label={label} relativeTime={relativeTime} />
      <FlightRoute flight={flight} />
      <FlightTimes flight={flight} />
    </div>
  )
}

function ConnectingFlightsCard(props: { label: string; flights: ParsedFlight[]; relativeTime: string | null }) {
  const { label, flights, relativeTime } = props

  const firstFlight = flights[0]
  const lastFlight = flights[flights.length - 1]

  // Summary: origin → final destination
  const originCity = firstFlight.departureCity || firstFlight.departureCode || '?'
  const destinationCity = lastFlight.arrivalCity || lastFlight.arrivalCode || '?'
  const connectionCount = flights.length - 1

  return (
    <div className='rounded-lg border bg-stone-50 p-3'>
      <FlightSectionLabel label={label} relativeTime={relativeTime} />

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

function PendingFlightCard(props: { label: string; relativeTime: string | null }) {
  const { label, relativeTime } = props

  return (
    <div className='rounded-lg border border-dashed border-stone-300 bg-stone-50/50 p-3'>
      <FlightSectionLabel label={label} relativeTime={relativeTime} />
      <Row className='items-center gap-2 text-sm text-tertiary'>
        <Clock className='size-4' />
        <span>Pending</span>
      </Row>
    </div>
  )
}

function FlightSectionLabel(props: { label: string; relativeTime: string | null }) {
  const { label, relativeTime } = props

  return (
    <Row className='items-center gap-1.5 mb-1'>
      <span className='text-xs font-medium text-tertiary'>{label}</span>
      {relativeTime && <span className='text-xs text-tertiary/70'>{relativeTime}</span>}
    </Row>
  )
}

/**
 * Returns a relative time label like "in 3 days" or "5 days ago"
 * Parses short date format like "Mar 22" and assumes current or next year
 * Only returns a label if the number of days is less than 30
 */
function getRelativeTimeLabelFromShortDate(shortDate: string): string | null {
  const date = parseShortDate(shortDate)
  if (!date) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffTime = date.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (Math.abs(diffDays) >= 30) return null

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'tomorrow'
  if (diffDays === -1) return 'yesterday'
  if (diffDays > 0) return `in ${diffDays} days`

  return `${Math.abs(diffDays)} days ago`
}

/**
 * Parses a short date like "Mar 22" into a Date object.
 * Assumes current year, or next year if the date would be more than 6 months in the past.
 */
function parseShortDate(shortDate: string): Date | null {
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  }

  const match = shortDate.match(/^([A-Za-z]{3})\s+(\d{1,2})$/)
  if (!match) return null

  const monthStr = match[1].toLowerCase()
  const day = parseInt(match[2], 10)
  const month = months[monthStr]

  if (month === undefined || isNaN(day)) return null

  const today = new Date()
  let year = today.getFullYear()

  // Create date with current year first
  const date = new Date(year, month, day)

  // If date is more than 6 months in the past, assume next year
  const sixMonthsAgo = new Date(today)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  if (date < sixMonthsAgo) {
    date.setFullYear(year + 1)
  }

  return date
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
    <div className='rounded-lg border bg-stone-50 p-3 text-sm text-tertiary whitespace-pre-line'>
      <Linkify text={sanitized} />
    </div>
  )
}

/**
 * Renders text with URLs and deep links as clickable anchors.
 * Supports http/https URLs and app deep links (e.g., app://, custom-scheme://)
 */
function Linkify(props: { text: string }) {
  const { text } = props

  const parts = splitTextByLinks(text)

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'link') {
          return (
            <a
              key={index}
              href={part.value}
              target='_blank'
              rel='noopener noreferrer'
              onClick={handleLinkClick}
              className='text-blue-600 hover:underline break-all'
            >
              {part.value}
            </a>
          )
        }

        return <span key={index}>{part.value}</span>
      })}
    </>
  )
}

function handleLinkClick(event: React.MouseEvent) {
  event.stopPropagation()
}

type TextPart = { type: 'text' | 'link'; value: string }

/**
 * Splits text into alternating text and link segments.
 * Matches:
 * - Standard URLs: http://, https://
 * - Deep links: any-scheme:// (e.g., slack://, notion://, app://)
 */
function splitTextByLinks(text: string): TextPart[] {
  // Match URLs with http(s) or custom schemes (word chars + hyphens followed by ://)
  const urlPattern = /(?:https?:\/\/|[a-zA-Z][a-zA-Z0-9+.-]*:\/\/)[^\s<>"')\]]+/g

  const parts: TextPart[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = urlPattern.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }

    // Clean up trailing punctuation that's likely not part of the URL
    let url = match[0]
    const trailingPunctuation = /[.,;:!?)]+$/
    const trailingMatch = url.match(trailingPunctuation)

    if (trailingMatch) {
      url = url.slice(0, -trailingMatch[0].length)
      parts.push({ type: 'link', value: url })
      parts.push({ type: 'text', value: trailingMatch[0] })
    } else {
      parts.push({ type: 'link', value: url })
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return parts
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

function extractLabeledSection(params: { description: string; label: string }): { details: string | null; remainingDescription: string } {
  const { description, label } = params
  if (!description.trim()) return { details: null, remainingDescription: '' }

  const labelPattern = new RegExp(`^\\s*${escapeRegex(label)}:\\s*(.*)$`, 'i')
  const lines = description.split('\n')
  const remainingLines: string[] = []
  const sectionLines: string[] = []
  let inSection = false
  let sectionFound = false

  for (const line of lines) {
    if (!sectionFound) {
      const match = line.match(labelPattern)
      if (match) {
        sectionFound = true
        inSection = true

        const firstLine = match[1].trim()
        if (firstLine) sectionLines.push(firstLine)
        continue
      }
    }

    if (inSection) {
      if (line.trim().length === 0) {
        inSection = false
        remainingLines.push('')
        continue
      }

      sectionLines.push(line.trim())
      continue
    }

    remainingLines.push(line)
  }

  const details = sectionLines.join('\n').trim()
  const remainingDescription = remainingLines.join('\n').trim()

  return {
    details: details ? details : null,
    remainingDescription,
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Parses all flights from description, handling:
 * - Multiple flights per section (connecting flights)
 * - Confirmation codes
 * - Various formats
 */
function parseAllFlights(rawDescription: string): ParsedFlights {
  const description = sanitizeHtml(rawDescription)
  const result = parseAllFlightsFromSanitized(description)
  return result
}

function parseAllFlightsFromSanitized(description: string): ParsedFlights {
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

