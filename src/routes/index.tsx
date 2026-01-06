import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { YearView } from '../components/calendar'
import { mockEvents } from '../data/mock-events'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [year, setYear] = useState(2026)

  return <YearView year={year} events={mockEvents} onYearChange={setYear} />
}
