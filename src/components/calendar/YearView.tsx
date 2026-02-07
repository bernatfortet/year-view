import { useEffect } from 'react'
import { useStore } from '@nanostores/react'

import { Row, Column } from '@/styles'
import type { YearViewProps } from './types'
import { MonthGrid } from './MonthGrid'
import { WeekdayHeader } from './WeekdayHeader'
import { $activeMonth } from './calendar.store'
import { $isSyncingEvents } from '@/stores/events.store'
import { getMonthName } from './utils'

const DEFAULT_DAY_SIZE = 100

function findScrollContainer(element: Element | null): Element | null {
  if (!element) return null
  return element.closest('[class*="overflow-auto"]')
}

function calculateScrollToTop(element: Element, scrollContainer: Element, headerOffset: number = 0): number {
  const elementRect = element.getBoundingClientRect()
  const containerRect = scrollContainer.getBoundingClientRect()
  const offsetToTop = elementRect.top - containerRect.top
  return scrollContainer.scrollTop + offsetToTop - headerOffset
}

function calculateScrollToCenter(element: Element, scrollContainer: Element): number {
  const elementRect = element.getBoundingClientRect()
  const containerRect = scrollContainer.getBoundingClientRect()
  return scrollContainer.scrollTop + elementRect.top - containerRect.top - containerRect.height / 2 + elementRect.height / 2
}

function getHeaderHeight(scrollContainer: Element, headerSelector: string): number {
  const headerElement = scrollContainer.querySelector(headerSelector)
  return headerElement instanceof HTMLElement ? headerElement.getBoundingClientRect().height : 0
}

export function YearView({ year, events, daySize = DEFAULT_DAY_SIZE }: YearViewProps) {
  const months = Array.from({ length: 12 }, (_, index) => index)
  const activeMonth = useStore($activeMonth)
  const isSyncing = useStore($isSyncingEvents)

  useEffect(() => {
    const currentYear = new Date().getFullYear()
    if (year !== currentYear) return

    const todayWeekElement = document.querySelector('[data-today-week="true"]')
    if (!todayWeekElement) return

    const scrollContainer = findScrollContainer(todayWeekElement)
    if (!scrollContainer) return

    const headerHeight = getHeaderHeight(scrollContainer, '[data-weekday-header="year-view"]')
    const targetScrollTop = calculateScrollToTop(todayWeekElement, scrollContainer, headerHeight)

    scrollContainer.scrollTop = targetScrollTop
  }, [year])

  function handleMonthClick(month: number) {
    const element = document.querySelector(`[data-month="${month}"]`)
    if (!element) return

    const scrollContainer = findScrollContainer(element)
    if (!scrollContainer) return

    const targetScroll = calculateScrollToCenter(element, scrollContainer)
    smoothScrollTo(scrollContainer, targetScroll, 200)
  }

  return (
    <div className='min-h-screen'>
      {/* Fixed Month Sidebar - Right side, centered vertically */}
      <Column className='fixed right-0 top-10 bottom-0 w-28 justify-center z-10'>
        {/* Sync indicator */}
        {isSyncing && (
          <Row className='absolute top-4 left-4 items-center gap-1.5 text-xs text-tertiary'>
            <div className='w-2.5 h-2.5 border-2 border-tertiary border-t-transparent rounded-full animate-spin' />
            <span>Syncing</span>
          </Row>
        )}

        {months.map((month) => {
          const isActive = month === activeMonth

          return (
            <button
              key={month}
              onClick={() => handleMonthClick(month)}
              className={`text-left pl-4 py-0.5 text-3xl font-medium transition-all duration-200 cursor-pointer hover:text-month-nav-inactive ${
                isActive ? 'text-brand-red font-bold' : 'text-month-nav-inactive'
              }`}
            >
              {getMonthName(month)}
            </button>
          )
        })}
      </Column>

      <WeekdayHeader variant='year-view' daySize={daySize} />

      {/* Main content area - centered */}
      <Column className='mr-28 items-center'>
        {/* Months Grid - Centered */}
        <div className='space-y-2 py-6'>
          {months.map((month) => (
            <MonthGrid key={month} year={year} month={month} events={events} daySize={daySize} />
          ))}
        </div>
      </Column>
    </div>
  )
}

function smoothScrollTo(element: Element, targetPosition: number, duration: number) {
  const startPosition = element.scrollTop
  const distance = targetPosition - startPosition
  const startTime = performance.now()

  function animate(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Ease out cubic for smooth deceleration
    const easeOut = 1 - Math.pow(1 - progress, 3)

    element.scrollTop = startPosition + distance * easeOut

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}
