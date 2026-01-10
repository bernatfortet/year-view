import { Row } from '@/styles'
import { getDayOfWeek, getWeekDayNames, isWeekendDay } from './utils'

const WEEKDAY_NAMES = getWeekDayNames()
const TODAY_DAY_OF_WEEK = getDayOfWeek(new Date())

type YearViewHeaderProps = {
  variant: 'year-view'
  daySize: number
}

type LinearViewHeaderProps = {
  variant: 'linear-view'
  columns: number
}

type WeekdayHeaderProps = YearViewHeaderProps | LinearViewHeaderProps

export function WeekdayHeader(props: WeekdayHeaderProps) {
  if (props.variant === 'year-view') {
    return <YearViewWeekdayHeader daySize={props.daySize} />
  }

  return <LinearViewWeekdayHeader columns={props.columns} />
}

function YearViewWeekdayHeader({ daySize }: { daySize: number }) {
  return (
    <div className='sticky top-0 z-30 bg-background-app border-b w-full'>
      <Row className='justify-center mr-28'>
        <Row className='items-center gap-12'>
          <div className='w-56' />
          <div className='grid grid-cols-7'>
            {WEEKDAY_NAMES.map((dayName, index) => {
              const isToday = index === TODAY_DAY_OF_WEEK
              const textColor = isToday ? 'text-brand-red' : 'text-tertiary'

              return (
                <div
                  key={dayName}
                  className={`text-center text-sm font-mono font-medium ${textColor} ${isWeekendDay(index) ? 'bg-black/10' : ''}`}
                  style={{ width: daySize }}
                >
                  {dayName}
                </div>
              )
            })}
          </div>
        </Row>
      </Row>
    </div>
  )
}

function LinearViewWeekdayHeader({ columns }: { columns: number }) {
  const repeatedHeaders = Array.from({ length: columns }, (_, index) => WEEKDAY_NAMES[index % 7])

  return (
    <div className='sticky top-0 z-30 bg-background border-b w-full'>
      <div className='grid' style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {repeatedHeaders.map((dayName, index) => {
          const dayOfWeek = index % 7
          const isToday = dayOfWeek === TODAY_DAY_OF_WEEK
          const textColor = isToday ? 'text-brand-red' : 'text-tertiary'

          return (
            <div
              key={index}
              className={`text-center text-[11px] font-mono font-medium ${textColor} ${isWeekendDay(dayOfWeek) ? 'bg-black/10' : ''}`}
            >
              {dayName}
            </div>
          )
        })}
      </div>
    </div>
  )
}
