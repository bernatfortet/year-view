import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})

function TermsPage() {
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
          Terms of Service
        </h1>

        <p className='text-black/50 mb-10'>Last updated: January 9, 2026</p>

        <div className='space-y-8 text-black/80' style={{ fontFamily: "'Inter', sans-serif" }}>
          <Section title='Service description'>
            <p>
              Year View is a calendar visualization tool that connects to your Google Calendar and displays your
              all-day events in an annual overview format. The service is designed to help you see your entire
              year at a glance.
            </p>
          </Section>

          <Section title='Account and access'>
            <p>
              To use Year View, you must sign in with a Google account and grant read-only access to your Google
              Calendar. You are responsible for maintaining the security of your Google account credentials.
            </p>
          </Section>

          <Section title='Acceptable use'>
            <p>You agree to use Year View only for:</p>
            <ul className='list-disc list-inside mt-3 space-y-1 text-black/70'>
              <li>Personal calendar viewing and planning purposes</li>
              <li>Lawful purposes in compliance with all applicable laws</li>
            </ul>
            <p className='mt-4'>You agree not to:</p>
            <ul className='list-disc list-inside mt-3 space-y-1 text-black/70'>
              <li>Attempt to access other users' data or accounts</li>
              <li>Use automated systems to access the service in a manner that sends excessive requests</li>
              <li>Attempt to circumvent any security measures</li>
            </ul>
          </Section>

          <Section title='Intellectual property'>
            <p>
              Year View and its original content, features, and functionality are owned by us and are protected
              by international copyright, trademark, and other intellectual property laws. Your calendar data
              remains your property.
            </p>
          </Section>

          <Section title='Disclaimer of warranties'>
            <p>
              Year View is provided "as is" and "as available" without warranties of any kind, either express or
              implied. We do not warrant that the service will be uninterrupted, secure, or error-free.
            </p>
            <p className='mt-4'>
              We are not responsible for any issues arising from Google Calendar API availability, your internet
              connection, or any third-party services.
            </p>
          </Section>

          <Section title='Limitation of liability'>
            <p>
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, including but not limited to loss of data, loss of
              profits, or business interruption.
            </p>
          </Section>

          <Section title='Service availability'>
            <p>
              We reserve the right to modify, suspend, or discontinue the service at any time without notice. We
              are not liable for any modification, suspension, or discontinuation of the service.
            </p>
          </Section>

          <Section title='Changes to these terms'>
            <p>
              We may update these terms from time to time. We will notify you of any changes by posting the new
              terms on this page and updating the "Last updated" date. Continued use of the service after changes
              constitutes acceptance of the new terms.
            </p>
          </Section>

          <Section title='Termination'>
            <p>You may stop using Year View at any time by:</p>
            <ol className='list-decimal list-inside mt-3 space-y-1 text-black/70'>
              <li>Signing out of the application</li>
              <li>
                Revoking access in your{' '}
                <a
                  href='https://myaccount.google.com/permissions'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-amber-600 hover:text-amber-700 underline'
                >
                  Google Account settings
                </a>
              </li>
            </ol>
          </Section>

          <Section title='Governing law'>
            <p>
              These terms shall be governed by and construed in accordance with the laws of the jurisdiction in
              which the service operator resides, without regard to conflict of law provisions.
            </p>
          </Section>

          <Section title='Contact'>
            <p>
              If you have any questions about these terms, please contact us at{' '}
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
