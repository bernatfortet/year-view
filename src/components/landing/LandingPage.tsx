import { useState } from 'react'
import { CalendarIcon, Grid3x3, Plane, Sparkles } from 'lucide-react'

type Props = {
  signIn: () => void
}

export function LandingPage(props: Props) {
  const { signIn } = props

  return (
    <div className='min-h-screen bg-cover bg-center bg-no-repeat' style={{ backgroundImage: "url('/bkg.png')" }}>
      <div className='absolute inset-0 border-5 rounded-[32px] border-brand-red' />
      <div className='absolute inset-0 border-[18px] rounded-[24px] border-brand-red' />
      <div className='absolute inset-0 border-5 border-brand-red' />

      {/* Hero Section */}
      <section className='pt-32 pb-12 px-6'>
        <div className='max-w-4xl mx-auto text-center'>
          {/* Title */}
          <h1 className='text-[72px] text-brand-blue mb-6' style={{ fontFamily: "'Instrument Serif', serif" }}>
            <span>Year</span>
            <span className='italic'>Trips</span>
            <span className='text-brand-red'>.</span>
            <span>com</span>
          </h1>

          {/* Subtitle */}
          <p className='text-[22px] text-gray-600 mb-10' style={{ fontFamily: "'Inter', sans-serif" }}>
            Year-wide view of all your calendar trips
          </p>

          {/* Buttons */}
          <div className='flex items-center justify-center gap-4 mb-6'>
            <button
              onClick={signIn}
              className='inline-flex items-center gap-3 px-7 py-3.5 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full hover:bg-white transition-all shadow-sm'
            >
              <GoogleIcon />
              <span className='font-medium'>Sign in with Google</span>
            </button>

            <button className='inline-flex items-center gap-2 px-7 py-3.5 bg-black/10 backdrop-blur-sm text-gray-700 rounded-full hover:bg-black/15 transition-all'>
              <span className='font-medium'>Try Demo</span>
            </button>
          </div>

          {/* Privacy & Terms */}
          <div className='flex items-center justify-center gap-6'>
            <a href='/privacy' className='text-sm text-gray-500 hover:text-gray-700 transition-colors'>
              Privacy
            </a>
            <a href='/terms' className='text-sm text-gray-500 hover:text-gray-700 transition-colors'>
              Terms
            </a>
          </div>
        </div>
      </section>

      {/* App Screenshot with Tabs */}
      <section className='px-6 pb-12'>
        <div className='max-w-4xl mx-auto'>
          <ScreenshotTabs />
        </div>
      </section>
    </div>
  )
}

type ScreenshotTab = 'year' | 'linear' | 'trips' | 'magic'

const SCREENSHOT_TABS: Array<{ id: ScreenshotTab; label: string; icon: React.ReactNode; screenshot: string }> = [
  {
    id: 'year',
    label: 'Year View',
    icon: <CalendarIcon className='w-4 h-4' />,
    screenshot: '/screenshots/year-view.png',
  },
  {
    id: 'linear',
    label: 'Linear View',
    icon: <Grid3x3 className='w-4 h-4' />,
    screenshot: '/screenshots/linear-view.png',
  },
  {
    id: 'trips',
    label: 'Trips View',
    icon: <Plane className='w-4 h-4' />,
    screenshot: '/screenshots/trips-view.png',
  },
  {
    id: 'magic',
    label: 'Magical Behavior',
    icon: <Sparkles className='w-4 h-4' />,
    screenshot: '/screenshots/magic-view.png',
  },
]

function ScreenshotTabs() {
  const [activeTab, setActiveTab] = useState<ScreenshotTab>('year')

  const currentTab = SCREENSHOT_TABS.find((tab) => tab.id === activeTab) ?? SCREENSHOT_TABS[0]

  return (
    <div className='rounded-xl overflow-hidden shadow-2xl bg-white'>
      {/* Tabs */}
      <div className='flex border-b border-gray-100'>
        {SCREENSHOT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'text-brand-red border-b-2 border-brand-red -mb-px' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Screenshot */}
      <div className='relative'>
        <img
          src={currentTab.screenshot}
          alt={`${currentTab.label} screenshot`}
          className='w-full h-auto'
          onError={(event) => {
            const target = event.currentTarget
            target.style.display = 'none'
            target.nextElementSibling?.classList.remove('hidden')
          }}
        />

        {/* Fallback placeholder */}
        <div className='hidden aspect-[16/10] flex items-center justify-center bg-gray-50'>
          <div className='text-center text-gray-400'>
            <svg className='w-16 h-16 mx-auto mb-3 opacity-50' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
            <p className='text-sm'>{currentTab.label} screenshot</p>
            <p className='text-xs mt-1 text-gray-300'>Add {currentTab.screenshot}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className='w-5 h-5' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
        fill='#4285F4'
      />
      <path
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
        fill='#34A853'
      />
      <path
        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
        fill='#FBBC05'
      />
      <path
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
        fill='#EA4335'
      />
    </svg>
  )
}
