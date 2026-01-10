import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { Plane, Copy, Check, Sparkles, ArrowLeft } from 'lucide-react'

import { Column, Row } from '@/styles'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const FLIGHT_PARSER_PROMPT = `Convert this flight information into the following structured format. Only output the formatted text, nothing else.

Format:

Confirmation: [CODE] (or multiple codes if different)
[If there's a main booking code AND separate flight codes, list like: "Confirmation: MAIN123 / AA456 (American)"]

Outbound:
Flight: [AIRLINE CODE] [FLIGHT NUMBER]
Departure: [CITY NAME] [AIRPORT CODE] [TIME WITH am/pm], [Month Day]
Arrival: [CITY NAME] [AIRPORT CODE] [TIME WITH am/pm], [Month Day]
[If connecting flight, add another Flight/Departure/Arrival block]

Return:
Flight: [AIRLINE CODE] [FLIGHT NUMBER]
Departure: [CITY NAME] [AIRPORT CODE] [TIME WITH am/pm], [Month Day]
Arrival: [CITY NAME] [AIRPORT CODE] [TIME WITH am/pm], [Month Day]

Rules:
- Airline codes are 2 letters (UA, AA, DL, AS, etc.)
- Airport codes are 3 letters (SFO, LAX, JFK, AUS, DFW, SJO, etc.)
- Time format: "5:30pm" or "10:00am" (with am/pm, no spaces)
- Date format: "Feb 15" or "Mar 2" (abbreviated month + day)
- If city name is unknown, just use the airport code
- If only one-way flight, only include "Outbound:" section
- If return flight is not booked yet, omit the "Return:" section entirely
- For confirmation codes: if there's one master code for the booking, just show that. If there are different codes per airline or leg, show all relevant ones
- For connecting flights on the same day/direction, group them under the same "Outbound:" or "Return:" section

Flight info to convert:
`

const parseFlightInfo = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data }) => {
    const result = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: FLIGHT_PARSER_PROMPT + data,
    })

    return result.text
  })

export const Route = createFileRoute('/ai/')({
  component: FlightParserPage,
})

function FlightParserPage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleParse() {
    if (!inputText.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await parseFlightInfo({ data: inputText })
      setOutputText(result)
    } catch (err) {
      console.error('🚨 Error parsing flight info:', err)
      setError('Failed to parse flight information. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCopy() {
    if (!outputText) return

    await navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-sky-50/80 via-white to-blue-50/50'>
      <div className='mx-auto max-w-3xl px-6 py-16'>
        <BackLink />

        <Header />

        <ContextSection />

        <Column className='gap-6'>
          <InputSection inputText={inputText} setInputText={setInputText} isLoading={isLoading} onParse={handleParse} />

          {error && <ErrorMessage message={error} />}

          {outputText && <OutputSection outputText={outputText} copied={copied} onCopy={handleCopy} />}
        </Column>
      </div>
    </div>
  )
}

function BackLink() {
  return (
    <Link to='/' className='mb-8 inline-flex items-center gap-2 font-medium text-sky-600 hover:text-sky-700'>
      <ArrowLeft className='size-4' />
      Back to Year View
    </Link>
  )
}

function Header() {
  return (
    <Row className='mb-2 items-center gap-3'>
      <div className='rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 p-2.5 shadow-lg shadow-sky-500/25'>
        <Plane className='size-6 text-white' />
      </div>
      <h1 className='text-4xl font-black text-black' style={{ fontFamily: "'Inter', sans-serif" }}>
        Flight Parser
      </h1>
    </Row>
  )
}

function ContextSection() {
  return (
    <Column className='mb-10 gap-4 text-black/70' style={{ fontFamily: "'Inter', sans-serif" }}>
      <p className='leading-relaxed'>
        When adding trip events to your calendar, having consistent flight details in the description makes it easy to reference your travel
        info at a glance. This tool takes messy flight confirmation emails and formats them into a clean, standardized format.
      </p>

      <div className='rounded-lg border border-sky-200 bg-sky-50/50 p-4'>
        <Row className='items-start gap-2'>
          <Sparkles className='mt-0.5 size-4 flex-shrink-0 text-sky-600' />
          <p className='text-sm text-sky-800'>
            <strong>How to use:</strong> Copy and paste your flight confirmation email, booking details, or any text containing flight
            information. The AI will extract the relevant details and format them consistently.
          </p>
        </Row>
      </div>
    </Column>
  )
}

function InputSection(props: { inputText: string; setInputText: (value: string) => void; isLoading: boolean; onParse: () => void }) {
  const { inputText, setInputText, isLoading, onParse } = props

  return (
    <Column className='gap-3'>
      <label className='text-sm font-semibold text-black/80'>Paste flight information</label>
      <Textarea
        value={inputText}
        onChange={(event) => setInputText(event.target.value)}
        placeholder='Paste your flight confirmation email, booking details, or any text with flight information...'
        className='min-h-48 resize-y border-sky-200 bg-white text-sm focus-visible:border-sky-400 focus-visible:ring-sky-400/30'
      />
      <Button
        onClick={onParse}
        disabled={!inputText.trim() || isLoading}
        size='lg'
        className='w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'
      >
        {isLoading ? (
          <Row className='items-center gap-2'>
            <div className='size-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
            Parsing...
          </Row>
        ) : (
          <Row className='items-center gap-2'>
            <Sparkles className='size-4' />
            Parse Flight Info
          </Row>
        )}
      </Button>
    </Column>
  )
}

function ErrorMessage(props: { message: string }) {
  const { message } = props

  return <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700'>{message}</div>
}

function OutputSection(props: { outputText: string; copied: boolean; onCopy: () => void }) {
  const { outputText, copied, onCopy } = props

  return (
    <Column className='gap-3'>
      <Row className='items-center justify-between'>
        <label className='text-sm font-semibold text-black/80'>Formatted output</label>
        <Button variant='outline' size='sm' onClick={onCopy} className='gap-1.5'>
          {copied ? (
            <>
              <Check className='size-3.5 text-green-600' />
              Copied!
            </>
          ) : (
            <>
              <Copy className='size-3.5' />
              Copy
            </>
          )}
        </Button>
      </Row>
      <pre className='whitespace-pre-wrap rounded-lg border border-sky-200 bg-sky-50/50 p-4 font-mono text-sm text-black/80'>
        {outputText}
      </pre>
    </Column>
  )
}
