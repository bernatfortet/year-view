import { useState } from 'react'
import { CalendarIcon, CircleHelp, Gift, Grid3x3, Plane, PlaneLanding, Sparkles } from 'lucide-react'

import { LinearYearView } from '@/components/calendar/LinearYearView'
import type { CalendarEvent } from '@/components/calendar/types'
import { YearView } from '@/components/calendar/YearView'
import { TripsView } from '@/components/trips/TripsView'
import { demoEvents } from '@/data/demo-data'
import { getPreviewYearFromDemoEvents } from '@/data/demo-utils'
import { Column, Row } from '@/styles'

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
    label: 'Magic Rules',
    icon: <Sparkles className='w-4 h-4' />,
  },
]

const LANDING_PREVIEW_DAY_SIZE = 66
const YEAR_PREVIEW_MONTH = 3

const YEAR_PREVIEW_EVENT_IDS = [
  'holiday-easter',
  'school-spring-break',
  'tentative-spring-break-trip',
  'family-abuela-birthday',
  'work-design-sprint',
]

const LINEAR_PREVIEW_EVENT_IDS = [
  'holiday-new-years',
  'work-offsite-austin',
  'holiday-mlk',
  'trip-presidents-weekend',
  'family-emma-birthday',
  'visit-genevieve-costa-rica',
  'trip-austin-wedding',
  'school-spring-break',
  'tentative-spring-break-trip',
  'work-design-sprint',
  'trip-big-sur-car',
  'trip-montreal-grand-prix',
  'work-company-summit',
  'trip-italy-summer',
  'holiday-july4',
  'family-reunion',
  'visit-parents-labor-day',
  'holiday-labor',
  'family-anniversary',
  'trip-fall-foliage-car',
  'work-offsite-nyc',
  'school-thanksgiving-break',
  'trip-thanksgiving-family',
  'holiday-christmas',
  'trip-ski-christmas',
]

const TRIPS_PREVIEW_EVENT_IDS = [
  'visit-genevieve-costa-rica',
  'trip-austin-wedding',
  'tentative-spring-break-trip',
  'trip-big-sur-car',
  'trip-montreal-grand-prix',
  'trip-italy-summer',
  'trip-ski-christmas',
]

const MAGIC_ITEMS = [
  {
    title: 'Tentative plans',
    description: 'Add a question mark (?) anywhere in the title and those days are highlighted automatically.',
    example: 'Kyoto Spring Break Trip?',
    icon: CircleHelp,
  },
  {
    title: 'Birthday grouping',
    description: 'Birthdays collapse into compact badges so busy weeks stay readable.',
    example: "Emma's Birthday Party",
    icon: Gift,
  },
  {
    title: 'Trips and visits',
    description: 'Trip and Visit titles become dedicated trip cards with travel context.',
    example: 'Austin Suzanne\'s Wedding Trip',
    icon: PlaneLanding,
  },
  {
    title: 'Cross-calendar story',
    description: 'School breaks, work trips, holidays, and family plans line up in one year-wide timeline.',
    example: 'Spring Break + Kyoto Trip? + NYC design sprint',
    icon: Plane,
  },
] as const

const yearPreviewEvents = pickEvents(YEAR_PREVIEW_EVENT_IDS)
const linearPreviewEvents = pickEvents(LINEAR_PREVIEW_EVENT_IDS)
const tripsPreviewEvents = pickEvents(TRIPS_PREVIEW_EVENT_IDS)
export function LandingDemoTabs() {
  const [activeTab, setActiveTab] = useState<LandingTab>('year')
  const previewYear = getPreviewYearFromDemoEvents(demoEvents)
  const panelClassName = getPanelClassName(activeTab)

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

      <div className={panelClassName}>
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
    return (
      <div className='pointer-events-none'>
        <YearView
          year={previewYear}
          events={yearPreviewEvents}
          daySize={LANDING_PREVIEW_DAY_SIZE}
          layoutMode='embedded'
          visibleMonths={[YEAR_PREVIEW_MONTH]}
          showMonthRail={false}
        />
      </div>
    )
  }

  if (activeTab === 'linear') {
    return (
      <div className='pointer-events-none'>
        <LinearYearView year={previewYear} events={linearPreviewEvents} layoutMode='embedded' />
      </div>
    )
  }

  if (activeTab === 'trips') {
    return (
      <div className='pointer-events-none [&_nav]:hidden [&_[data-slot=tabs-list]]:hidden [&_h2]:hidden [&_.max-w-4xl]:max-w-none [&_.mx-auto]:mx-0 [&_.px-4]:px-8 [&_.py-8]:py-8'>
        <TripsView events={tripsPreviewEvents} year={previewYear} />
      </div>
    )
  }

  return <MagicRulesPanel />
}

function MagicRulesPanel() {
  return (
    <Column className='p-8 gap-6'>
      <Column className='gap-2'>
        <h3 className='text-2xl text-brand-blue font-semibold'>Magic rules with real calendar data</h3>
        <p className='text-sm text-gray-600 max-w-2xl'>
          YearTrips reads patterns already hiding in your titles and turns them into clearer visual layers automatically.
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

function pickEvents(ids: string[]): CalendarEvent[] {
  const idSet = new Set(ids)
  const result = demoEvents.filter((event) => idSet.has(event.id))
  return result
}

function getPanelClassName(activeTab: LandingTab) {
  if (activeTab === 'year') {
    return 'relative overflow-hidden bg-background-app'
  }

  return 'relative h-[620px] overflow-auto bg-background-app'
}
