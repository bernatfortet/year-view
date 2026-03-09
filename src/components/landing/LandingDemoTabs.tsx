import { useState } from 'react'
import { CalendarIcon, Car, CircleHelp, Gift, Grid3x3, Plane, PlaneLanding, Sparkles } from 'lucide-react'

import { LinearYearView } from '@/components/calendar/LinearYearView'
import type { CalendarEvent } from '@/components/calendar/types'
import { YearView } from '@/components/calendar/YearView'
import { TripsView } from '@/components/trips/TripsView'
import { Column, Row } from '@/styles'
import { demoEvents } from '@/data/demo-data'

type LandingTab = 'year' | 'linear' | 'trips' | 'magic'

type LandingTabConfig = {
  id: LandingTab
  label: string
  icon: React.ReactNode
}

const LANDING_TABS: LandingTabConfig[] = [
  {
    id: 'year',
    label: 'Year View',
    icon: <CalendarIcon className='w-4 h-4' />,
  },
  {
    id: 'linear',
    label: 'Linear View',
    icon: <Grid3x3 className='w-4 h-4' />,
  },
  {
    id: 'trips',
    label: 'Trips View',
    icon: <Plane className='w-4 h-4' />,
  },
  {
    id: 'magic',
    label: 'Magical Behavior',
    icon: <Sparkles className='w-4 h-4' />,
  },
]

const LANDING_PREVIEW_DAY_SIZE = 66

const MAGIC_ITEMS = [
  {
    title: 'Tentative plans',
    description: 'Add a question mark (?) anywhere in the event title and those days are highlighted automatically.',
    example: 'Trip to Paris?',
    icon: CircleHelp,
  },
  {
    title: 'Birthday grouping',
    description: 'Birthdays are grouped into compact badges so busy weeks stay readable.',
    example: "Emma's Birthday",
    icon: Gift,
  },
  {
    title: 'Trips and visits',
    description: 'Events with Trip or Visit: are promoted into dedicated trip cards with status and travel details.',
    example: 'Visit: Mom & Dad',
    icon: PlaneLanding,
  },
  {
    title: 'Travel mode icons',
    description: 'Trip titles containing Car show car icons while flights keep plane icons.',
    example: 'Car Trip to Napa',
    icon: Car,
  },
] as const

export function LandingDemoTabs() {
  const [activeTab, setActiveTab] = useState<LandingTab>('year')
  const previewYear = getPreviewYearFromDemoEvents(demoEvents)

  return (
    <Column className='rounded-xl overflow-hidden shadow-2xl bg-white'>
      <Row className='border-b border-gray-100'>
        {LANDING_TABS.map((tab) => {
          const isActive = tab.id === activeTab

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors cursor-pointer ${
                isActive ? 'text-brand-red border-b-2 border-brand-red -mb-px' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </Row>

      <div className='relative h-[620px] overflow-auto bg-background-app'>
        <LandingTabPanel activeTab={activeTab} previewYear={previewYear} />
      </div>
    </Column>
  )
}

type LandingTabPanelProps = {
  activeTab: LandingTab
  previewYear: number
}

function LandingTabPanel(props: LandingTabPanelProps) {
  const { activeTab, previewYear } = props

  if (activeTab === 'year') {
    return <YearView year={previewYear} events={demoEvents} daySize={LANDING_PREVIEW_DAY_SIZE} layoutMode='embedded' />
  }

  if (activeTab === 'linear') {
    return <LinearYearView year={previewYear} events={demoEvents} layoutMode='embedded' />
  }

  if (activeTab === 'trips') {
    return <TripsView events={demoEvents} year={previewYear} />
  }

  return <MagicDemoPanel />
}

function getPreviewYearFromDemoEvents(events: CalendarEvent[]): number {
  if (events.length === 0) return new Date().getFullYear()

  const firstEvent = events[0]
  const startYear = Number.parseInt(firstEvent?.startDate.slice(0, 4), 10)

  if (Number.isNaN(startYear)) return new Date().getFullYear()

  return startYear
}

function MagicDemoPanel() {
  return (
    <Column className='p-8 gap-6'>
      <Column className='gap-2'>
        <h3 className='text-2xl text-brand-blue font-semibold'>Magic behaviors with real data</h3>
        <p className='text-sm text-gray-600 max-w-2xl'>
          YearTrips detects patterns in your existing calendar titles and turns them into useful visual layers automatically.
        </p>
      </Column>

      <Column className='gap-3'>
        {MAGIC_ITEMS.map((item) => {
          const Icon = item.icon

          return (
            <Row key={item.title} className='items-start gap-3 rounded-lg border border-stone-200 bg-white p-4'>
              <Row className='items-center justify-center w-9 h-9 rounded-lg bg-stone-100 shrink-0'>
                <Icon className='w-4 h-4 text-brand-blue' />
              </Row>

              <Column className='gap-1'>
                <h4 className='text-sm font-semibold text-brand-blue'>{item.title}</h4>
                <p className='text-sm text-gray-600'>{item.description}</p>
                <p className='text-xs text-gray-500'>
                  Example: <span className='font-medium text-gray-700'>{item.example}</span>
                </p>
              </Column>
            </Row>
          )
        })}
      </Column>
    </Column>
  )
}
