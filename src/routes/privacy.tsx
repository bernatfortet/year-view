import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-amber-50/80 via-white to-orange-50/50'>
      <div className='max-w-3xl mx-auto px-6 py-16'>
        <Link
          to='/'
          className='inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-8 font-medium'
        >
          <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
          </svg>
          Back to Year View
        </Link>

        <h1 className='text-4xl font-black text-black mb-2' style={{ fontFamily: "'Inter', sans-serif" }}>
          Privacy Policy
        </h1>

        <p className='text-black/50 mb-10'>Last updated: January 9, 2026</p>

        <div className='space-y-8 text-black/80' style={{ fontFamily: "'Inter', sans-serif" }}>
          <Section title='What data we access'>
            <p>
              Year View connects to your Google Calendar using read-only access. We access your calendar events
              solely to display them in our year view format. We request the following permissions:
            </p>
            <ul className='list-disc list-inside mt-3 space-y-1 text-black/70'>
              <li>Read your calendar events (calendar.readonly)</li>
              <li>View your email address and basic profile information</li>
            </ul>
          </Section>

          <Section title='What we store'>
            <p>We store the following data:</p>
            <ul className='list-disc list-inside mt-3 space-y-1 text-black/70'>
              <li>
                <strong>OAuth tokens:</strong> Stored securely in encrypted HTTP-only cookies in your browser
              </li>
              <li>
                <strong>Calendar preferences:</strong> Which calendars you've selected to display (stored locally
                in your browser)
              </li>
            </ul>
            <p className='mt-4'>
              <strong>We do NOT store your calendar events on our servers.</strong> Events are fetched directly
              from Google's servers each time you view the calendar.
            </p>
          </Section>

          <Section title="What we don't do">
            <ul className='list-disc list-inside space-y-1 text-black/70'>
              <li>We never create, modify, or delete your calendar events</li>
              <li>We never share your data with third parties</li>
              <li>We never sell your data</li>
              <li>We never use your data for advertising</li>
              <li>We never store your calendar events on our servers</li>
            </ul>
          </Section>

          <Section title='Data security'>
            <p>
              Your OAuth tokens are encrypted and stored in HTTP-only cookies, which means they cannot be
              accessed by JavaScript running in your browser. All communication with Google's servers uses HTTPS
              encryption.
            </p>
          </Section>

          <Section title='Data deletion'>
            <p>To remove Year View's access to your Google Calendar:</p>
            <ol className='list-decimal list-inside mt-3 space-y-1 text-black/70'>
              <li>
                Go to your{' '}
                <a
                  href='https://myaccount.google.com/permissions'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-amber-600 hover:text-amber-700 underline'
                >
                  Google Account → Security → Third-party apps
                </a>
              </li>
              <li>Find "Year View" and click "Remove Access"</li>
              <li>Clear your browser cookies to remove the local session</li>
            </ol>
          </Section>

          <Section title='Third-party services'>
            <p>Year View uses the following third-party services:</p>
            <ul className='list-disc list-inside mt-3 space-y-1 text-black/70'>
              <li>
                <strong>Google Calendar API:</strong> To fetch your calendar events
              </li>
              <li>
                <strong>Vercel:</strong> For hosting the application
              </li>
            </ul>
          </Section>

          <Section title='Changes to this policy'>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting
              the new policy on this page and updating the "Last updated" date.
            </p>
          </Section>

          <Section title='Contact'>
            <p>
              If you have any questions about this privacy policy, please contact us at{' '}
              <a href='mailto:bernat@fornes.dev' className='text-amber-600 hover:text-amber-700 underline'>
                bernat@fornes.dev
              </a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section(props: { title: string; children: React.ReactNode }) {
  const { title, children } = props

  return (
    <section>
      <h2 className='text-xl font-bold text-black mb-3'>{title}</h2>
      <div className='leading-relaxed'>{children}</div>
    </section>
  )
}
