import { useState, useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { Settings } from 'lucide-react'

import { Column } from '@/styles'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from './ui/sheet'
import { $excludeTerms, setExcludeTermsFromInput } from '@/stores/settings.store'

export function SettingsSheet() {
  const excludeTerms = useStore($excludeTerms)
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Sync input value when sheet opens or terms change
  useEffect(() => {
    if (isOpen) {
      setInputValue(excludeTerms.join(', '))
    }
  }, [isOpen, excludeTerms])

  function handleSave() {
    setExcludeTermsFromInput(inputValue)
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger render={<Button variant='ghost' size='icon' title='Settings' />}>
        <Settings className='size-4' />
      </SheetTrigger>

      <SheetContent side='right'>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Configure your calendar view preferences.</SheetDescription>
        </SheetHeader>

        <Column className='flex-1 p-6 space-y-6'>
          <ExcludeEventsSection inputValue={inputValue} onInputChange={setInputValue} />
        </Column>

        <SheetFooter>
          <SheetClose render={<Button variant='outline' />}>Cancel</SheetClose>
          <Button onClick={handleSave}>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

type ExcludeEventsSectionProps = {
  inputValue: string
  onInputChange: (value: string) => void
}

function ExcludeEventsSection(props: ExcludeEventsSectionProps) {
  const { inputValue, onInputChange } = props

  return (
    <div className='space-y-3'>
      <div>
        <label htmlFor='exclude-terms' className='text-sm font-medium'>
          Exclude events containing...
        </label>
        <p className='text-xs text-muted-foreground mt-1'>
          Hide events whose title contains any of these terms.
        </p>
      </div>

      <Input
        id='exclude-terms'
        placeholder='home, work, groceries'
        value={inputValue}
        onChange={(event) => onInputChange(event.target.value)}
      />

      <div className='text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-md'>
        <p className='font-medium text-foreground'>How it works:</p>
        <ul className='list-disc list-inside space-y-0.5 text-muted-foreground'>
          <li>Separate multiple terms with commas</li>
          <li>Matching is case-insensitive</li>
          <li>Partial matches count (e.g. "work" matches "Work meeting")</li>
        </ul>
      </div>
    </div>
  )
}

