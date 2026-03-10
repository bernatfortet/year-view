// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FlightInfo } from './FlightInfo'

const CONNECTING_TRIP_DESCRIPTION = [
  'Confirmation: B62038 / B62271',
  '',
  'Outbound:',
  'Flight: AA 2457',
  'Departure: San Jose SJC 8:59am, Mar 19',
  'Arrival: Fort Lauderdale FLL 1:58pm, Mar 19',
  'Flight: AA 1879',
  'Departure: Fort Lauderdale FLL 8:00pm, Mar 19',
  'Arrival: Austin AUS 9:56pm, Mar 19',
  '',
  'Return:',
  'Flight: AA 1149',
  'Departure: Austin AUS 4:29pm, Mar 22',
  'Arrival: Dallas-Ft. Worth DFW 5:49pm, Mar 22',
  'Flight: AA 1453',
  'Departure: Dallas-Ft. Worth DFW 6:38pm, Mar 22',
  'Arrival: San Jose SJC 9:43pm, Mar 22',
  '',
  'Hotel:',
  'Confirmation: 964476494',
  'Arbor House of Dripping Springs - Serenity Hollow',
  '',
  'Car Rental:',
  'Confirmation: 73367766816280',
  'Thu, Mar 19, 10:00pm - Sun, Mar 22, 3:30pm',
].join('\n')

describe('FlightInfo', () => {
  it('renders rich travel details for connecting flights', () => {
    render(<FlightInfo description={CONNECTING_TRIP_DESCRIPTION} />)

    expect(screen.getByText('B62038 / B62271')).toBeTruthy()
    expect(screen.getByText('Outbound')).toBeTruthy()
    expect(screen.getByText('San Jose to Austin')).toBeTruthy()
    expect(screen.getAllByText('1 connection')).toHaveLength(2)
    expect(screen.getByText('AA 2457')).toBeTruthy()

    expect(screen.getByText('Return')).toBeTruthy()
    expect(screen.getByText('Austin to San Jose')).toBeTruthy()
    expect(screen.getByText('AA 1453')).toBeTruthy()

    expect(screen.getByText('Hotel')).toBeTruthy()
    expect(screen.getByText(/Arbor House of Dripping Springs/)).toBeTruthy()

    expect(screen.getByText('Car Rental')).toBeTruthy()
    expect(screen.getByText(/73367766816280/)).toBeTruthy()
  })
})
