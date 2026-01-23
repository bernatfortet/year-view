import { CircleHelp, Gift, type LucideIcon, SparklesIcon, Plane, Car, Mail, PlaneLanding } from 'lucide-react'
import { useState } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Column, Row } from '@/styles'
import { cn } from '@/lib/utils'

interface BehaviorSection {
  title: string
  content: string
}

interface Behavior {
  id: string
  icon: LucideIcon
  title: string
  description: string
  example: string
  result?: string
  sections?: BehaviorSection[]
}

const BEHAVIORS: Behavior[] = [
  {
    id: 'tentative',
    icon: CircleHelp,
    title: 'Tentative Events',
    description: 'Add a question mark (?) anywhere in your event title to mark it as tentative.',
    example: 'Trip to Paris?',
    result: 'The day cells for that event will have a yellow background, making it easy to spot plans that are not yet confirmed.',
  },
  {
    id: 'birthdays',
    icon: Gift,
    title: 'Birthday Events',
    description: 'Events containing "Birthday", "Bday", "Aniversario", or "Aniversari" in the title are automatically grouped.',
    example: "John's Birthday",
    result: 'Instead of showing as regular event bars, birthdays appear as a compact badge with a gift icon and count. Hover to see the full list.',
  },
  {
    id: 'trips',
    icon: Plane,
    title: 'Trips',
    description: 'Events with "Trip" in the title appear in a dedicated Trips tab, organized by upcoming and past.',
    example: 'Trip to Japan',
    sections: [
      {
        title: 'Trip States',
        content: 'Trips show badges based on their state: "Needs planning" (has ?), "Needs info" (no description), or full flight details (has description).',
      },
      {
        title: 'Icons',
        content: 'Events with "Car" in the title show a car icon instead of a plane.',
      },
      {
        title: 'Flight Info Format',
        content: 'Add flight details in the description using: Flight: AA 123, Departure: City CODE time, date, Arrival: City CODE time, date.',
      },
      {
        title: 'Email Links',
        content: 'Gmail links in the description appear as a "View Email" button in the trip header.',
      },
    ],
  },
  {
    id: 'visits',
    icon: PlaneLanding,
    title: 'Visits',
    description: 'Track when someone is visiting you by starting the event title with "Visit:".',
    example: 'Visit: Mom & Dad',
    result: 'The event shows a landing plane icon, the days are highlighted with a colored pattern, and visits appear in the Trips & Visits tab alongside your trips.',
  },
]

type BehaviorId = (typeof BEHAVIORS)[number]['id']

export function MagicBehaviors() {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<BehaviorId>('tentative')

  const selectedBehavior = BEHAVIORS.find((b) => b.id === selectedId) as Behavior

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className='flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer'
      >
        <SparklesIcon className='w-3.5 h-3.5' />
        Magic
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-xl p-0 overflow-hidden h-[500px]'>
          <Row className='h-full'>
            <Column className='w-48 shrink-0 border-r border-stone-200 bg-stone-50 p-4'>
              <DialogHeader className='mb-4'>
                <DialogTitle className='flex items-center gap-2 text-base'>
                  <SparklesIcon className='w-4 h-4 text-orange-500' />
                  Magic behaviors
                </DialogTitle>
              </DialogHeader>

              <Column className='gap-1'>
                {BEHAVIORS.map((behavior) => (
                  <BehaviorNavItem
                    key={behavior.id}
                    icon={behavior.icon}
                    title={behavior.title}
                    isSelected={selectedId === behavior.id}
                    onClick={() => setSelectedId(behavior.id)}
                  />
                ))}
              </Column>
            </Column>

            <Column className='flex-1 p-6 overflow-y-auto'>
              <BehaviorDetail behavior={selectedBehavior} />
            </Column>
          </Row>
        </DialogContent>
      </Dialog>
    </>
  )
}

type BehaviorNavItemProps = {
  icon: LucideIcon
  title: string
  isSelected: boolean
  onClick: () => void
}

function BehaviorNavItem(props: BehaviorNavItemProps) {
  const { icon: Icon, title, isSelected, onClick } = props

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left cursor-pointer',
        isSelected ? 'bg-white text-primary shadow-sm' : 'text-tertiary hover:text-primary hover:bg-white/50'
      )}
    >
      <Icon className='w-4 h-4 shrink-0' />
      <span className='truncate'>{title}</span>
    </button>
  )
}

function BehaviorDetail(props: { behavior: Behavior }) {
  const { behavior } = props
  const Icon = behavior.icon

  return (
    <Column className='gap-4'>
      <Row className='items-center gap-2'>
        <Icon className='w-5 h-5 text-tertiary' />
        <h3 className='font-semibold text-primary'>{behavior.title}</h3>
      </Row>

      <p className='text-sm text-tertiary leading-relaxed'>{behavior.description}</p>

      <div className='bg-stone-50 rounded-md px-3 py-2 text-sm'>
        <span className='text-tertiary'>Example:</span> <span className='font-medium text-primary'>{behavior.example}</span>
      </div>

      {behavior.result && <p className='text-sm text-tertiary leading-relaxed'>{behavior.result}</p>}

      {behavior.sections && (
        <Column className='gap-3 pt-2 border-t border-stone-200'>
          {behavior.sections.map((section) => (
            <div key={section.title}>
              <h4 className='text-xs font-semibold text-primary mb-1'>{section.title}</h4>
              <p className='text-xs text-tertiary leading-relaxed'>{section.content}</p>
            </div>
          ))}
        </Column>
      )}
    </Column>
  )
}
