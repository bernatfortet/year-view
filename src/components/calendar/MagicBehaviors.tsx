import { CircleHelp, Gift, type LucideIcon, SparklesIcon, Plane } from 'lucide-react'
import { useState } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Column, Row } from '@/styles'
import { cn } from '@/lib/utils'

const BEHAVIORS = [
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
    result: 'Trips have three states: with "?" shows "Needs planning", with a description shows flight/travel info, without either shows "Needs info". Add flight details in the event description to see them rendered.',
  },
] as const

type BehaviorId = (typeof BEHAVIORS)[number]['id']

export function MagicBehaviors() {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<BehaviorId>('tentative')

  const selectedBehavior = BEHAVIORS.find((b) => b.id === selectedId)!

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
        <DialogContent className='max-w-xl p-0 overflow-hidden'>
          <Row className='min-h-[320px]'>
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

            <Column className='flex-1 p-6'>
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

type Behavior = (typeof BEHAVIORS)[number]

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

      <p className='text-sm text-tertiary leading-relaxed'>{behavior.result}</p>
    </Column>
  )
}
