import { Plane } from 'lucide-react'

import { Row } from '@/styles'

interface FlightInfoProps {
  description: string
}

interface ParsedFlight {
  label?: string // "Return", "Outbound", etc.
  flightNumber: string
  airline: string
  departureCity: string
  departureCode: string
  departureTime: string
  departureDate?: string
  arrivalCity: string
  arrivalCode: string
  arrivalTime: string
  arrivalDate?: string
}

export function FlightInfo(props: FlightInfoProps) {
  const { description } = props

  const flight = parseFlightDescription(description)

  if (!flight) {
    return <RawDescription description={description} />
  }

  return (
    <div className='mt-3 rounded-lg border bg-stone-50 p-3'>
      {flight.label && <div className='text-xs font-medium text-tertiary'>{flight.label}</div>}

      <FlightRoute flight={flight} />
      <FlightTimes flight={flight} />
    </div>
  )
}

function FlightRoute(props: { flight: ParsedFlight }) {
  const { flight } = props

  return (
    <Row className='items-center justify-between mb-2'>
      <span className='text-base font-semibold text-primary'>
        {flight.departureCity} to {flight.arrivalCity}
      </span>
      <Row className='items-center gap-1.5 text-sm text-tertiary'>
        <Plane className='size-3.5' />
        <span>
          {flight.airline} {flight.flightNumber}
        </span>
      </Row>
    </Row>
  )
}

function FlightTimes(props: { flight: ParsedFlight }) {
  const { flight } = props

  const departureDisplay = flight.departureDate ? `${flight.departureTime}, ${flight.departureDate}` : flight.departureTime

  const arrivalDisplay = flight.arrivalDate ? `${flight.arrivalTime}, ${flight.arrivalDate}` : flight.arrivalTime

  return (
    <Row className='items-center gap-6 text-sm'>
      <Row className='items-center gap-2'>
        <div className='rounded-full bg-stone-800 p-1'>
          <svg className='size-2.5 text-white' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
            <path d='M7 17L17 7M17 7H7M17 7V17' />
          </svg>
        </div>
        <span className='text-tertiary'>{flight.departureCode}</span>
        <span className='font-medium text-primary'>{departureDisplay}</span>
      </Row>

      <Row className='items-center gap-2'>
        <div className='rounded-full bg-stone-800 p-1'>
          <svg className='size-2.5 text-white' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
            <path d='M7 7L17 17M17 17H7M17 17V7' />
          </svg>
        </div>
        <span className='text-tertiary'>{flight.arrivalCode}</span>
        <span className='font-medium text-primary'>{arrivalDisplay}</span>
      </Row>
    </Row>
  )
}

function RawDescription(props: { description: string }) {
  const { description } = props

  // Fallback: show first 2 lines of raw description
  const lines = description.split('\n').filter((line) => line.trim())
  const preview = lines.slice(0, 2).join('\n')
  const hasMore = lines.length > 2

  return (
    <div className='mt-2 text-sm text-tertiary whitespace-pre-line'>
      {preview}
      {hasMore && <span className='text-tertiary'>...</span>}
    </div>
  )
}

/**
 * Parses flight description in the format:
 *
 * Return:
 * Flight: UA 2312
 * Departure: San Francisco SFO 12:05am, Dec 19 (local time)
 * Arrival: San José SJO 8:32am, Dec 19 (local time)
 */
function parseFlightDescription(description: string): ParsedFlight | null {
  const lines = description
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  let label: string | undefined
  let flightLine: string | undefined
  let departureLine: string | undefined
  let arrivalLine: string | undefined

  for (const line of lines) {
    const lineLower = line.toLowerCase()

    if (lineLower.startsWith('flight:')) {
      flightLine = line
    } else if (lineLower.startsWith('departure:')) {
      departureLine = line
    } else if (lineLower.startsWith('arrival:')) {
      arrivalLine = line
    } else if (line.endsWith(':') && !flightLine) {
      // First line ending with ":" is likely the label (Return:, Outbound:, etc.)
      label = line.slice(0, -1)
    }
  }

  if (!flightLine || !departureLine || !arrivalLine) return null

  const flightInfo = parseFlightLine(flightLine)
  const departure = parseLocationLine(departureLine)
  const arrival = parseLocationLine(arrivalLine)

  if (!flightInfo || !departure || !arrival) return null

  return {
    label,
    ...flightInfo,
    departureCity: departure.city,
    departureCode: departure.code,
    departureTime: departure.time,
    departureDate: departure.date,
    arrivalCity: arrival.city,
    arrivalCode: arrival.code,
    arrivalTime: arrival.time,
    arrivalDate: arrival.date,
  }
}

/**
 * Parses "Flight: UA 2312" into airline and flight number
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
 * Parses "Departure: San Francisco SFO 12:05am, Dec 19 (local time)"
 * into city, code, time, and optional date
 */
function parseLocationLine(line: string): { city: string; code: string; time: string; date?: string } | null {
  // Remove the prefix (Departure: or Arrival:)
  const content = line.replace(/^(departure|arrival):\s*/i, '')

  // Match pattern: City Name CODE TIME, DATE (optional stuff)
  // Airport codes are 3 uppercase letters
  // Date format: "Dec 19" or "Jan 5" etc.
  const match = content.match(/^(.+?)\s+([A-Z]{3})\s+(\d{1,2}:\d{2}\s*(?:am|pm)?),?\s*([A-Z][a-z]{2}\s+\d{1,2})?/i)
  if (!match) return null

  return {
    city: match[1].trim(),
    code: match[2].toUpperCase(),
    time: match[3].toLowerCase().replace(/\s+/g, ''),
    date: match[4]?.trim(),
  }
}
