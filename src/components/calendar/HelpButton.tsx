import { HelpCircle, CircleHelp, Gift, type LucideIcon, SparklesIcon } from 'lucide-react'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useState } from 'react'

export function HelpButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className='fixed bottom-6 right-6 w-11 h-11 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center text-stone-500 hover:text-stone-700 hover:shadow-lg transition-all cursor-pointer z-50'
        aria-label='Help'
      >
        <SparklesIcon className='w-5 h-5' />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side='right' className='w-80'>
          <SheetHeader>
            <SheetTitle className='flex items-center gap-2'>
              <SparklesIcon className='w-5 h-5 text-orange-500' />
              Special Behaviors
            </SheetTitle>
          </SheetHeader>

          <div className='p-6 space-y-10'>
            <HelpSection
              icon={CircleHelp}
              title='Tentative Events'
              description='Add a question mark (?) anywhere in your event title to mark it as tentative.'
              example='Trip to Paris?'
              result='The day cells for that event will have a yellow background, making it easy to spot plans that are not yet confirmed.'
            />

            <HelpSection
              icon={Gift}
              title='Birthday Events'
              description='Events containing "Birthday", "Bday", "Aniversario", or "Aniversari" in the title are automatically grouped.'
              example="John's Birthday"
              result='Instead of showing as regular event bars, birthdays appear as a compact badge with a gift icon and count. Hover to see the full list.'
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

type HelpSectionProps = {
  icon: LucideIcon
  title: string
  description: string
  example: string
  result: string
}

function HelpSection(props: HelpSectionProps) {
  const { icon: Icon, title, description, example, result } = props

  return (
    <div className='space-y-2'>
      <h3 className='font-medium text-sm text-stone-900 flex items-center gap-2'>
        <Icon className='w-4 h-4 text-stone-500' />
        {title}
      </h3>
      <p className='text-sm text-stone-600'>{description}</p>
      <div className='bg-stone-50 rounded-md px-3 py-2 text-sm'>
        <span className='text-stone-400'>Example:</span> <span className='font-medium text-stone-700'>{example}</span>
      </div>
      <p className='text-sm text-stone-500'>{result}</p>
    </div>
  )
}
