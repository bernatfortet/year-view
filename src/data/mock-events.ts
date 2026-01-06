import type { CalendarEvent } from '../components/calendar/types'

/**
 * Mock calendar events for testing the year view UI
 * Events use 2026 dates to match the current year context
 */
export const mockEvents: CalendarEvent[] = [
  // January events
  {
    id: '1',
    summary: 'New Year Holiday',
    startDate: '2026-01-01',
    endDate: '2026-01-02',
    colorId: '11', // Tomato
    status: 'confirmed',
  },
  {
    id: '2',
    summary: 'Winter Vacation',
    description: 'Family ski trip to the mountains',
    startDate: '2026-01-05',
    endDate: '2026-01-12',
    colorId: '7', // Peacock
    status: 'confirmed',
  },
  {
    id: '3',
    summary: 'Team Offsite',
    startDate: '2026-01-08',
    endDate: '2026-01-10',
    colorId: '3', // Grape
    status: 'confirmed',
  },
  {
    id: '4',
    summary: 'MLK Day',
    startDate: '2026-01-19',
    endDate: '2026-01-20',
    colorId: '8', // Graphite
    status: 'confirmed',
  },

  // February events
  {
    id: '5',
    summary: 'Valentine\'s Day',
    startDate: '2026-02-14',
    endDate: '2026-02-15',
    colorId: '4', // Flamingo
    status: 'confirmed',
  },
  {
    id: '6',
    summary: 'Presidents Day Weekend',
    startDate: '2026-02-14',
    endDate: '2026-02-17',
    colorId: '9', // Blueberry
    status: 'confirmed',
  },

  // March events
  {
    id: '7',
    summary: 'Spring Break',
    description: 'Beach trip with friends',
    startDate: '2026-03-14',
    endDate: '2026-03-22',
    colorId: '2', // Sage
    status: 'confirmed',
  },
  {
    id: '8',
    summary: 'Conference',
    startDate: '2026-03-16',
    endDate: '2026-03-18',
    colorId: '6', // Tangerine
    status: 'confirmed',
  },
  {
    id: '9',
    summary: 'Workshop',
    startDate: '2026-03-17',
    endDate: '2026-03-18',
    colorId: '1', // Lavender
    status: 'tentative',
  },

  // April events
  {
    id: '10',
    summary: 'Easter Weekend',
    startDate: '2026-04-03',
    endDate: '2026-04-06',
    colorId: '5', // Banana
    status: 'confirmed',
  },
  {
    id: '11',
    summary: 'Tax Day',
    startDate: '2026-04-15',
    endDate: '2026-04-16',
    colorId: '11', // Tomato
    status: 'confirmed',
  },

  // May events
  {
    id: '12',
    summary: 'Memorial Day Weekend',
    startDate: '2026-05-23',
    endDate: '2026-05-26',
    colorId: '9', // Blueberry
    status: 'confirmed',
  },
  {
    id: '13',
    summary: 'Mother\'s Day',
    startDate: '2026-05-10',
    endDate: '2026-05-11',
    colorId: '4', // Flamingo
    status: 'confirmed',
  },

  // June events
  {
    id: '14',
    summary: 'Summer Vacation',
    description: 'Two week trip to Europe',
    startDate: '2026-06-15',
    endDate: '2026-06-29',
    colorId: '7', // Peacock
    status: 'confirmed',
  },
  {
    id: '15',
    summary: 'Father\'s Day',
    startDate: '2026-06-21',
    endDate: '2026-06-22',
    colorId: '9', // Blueberry
    status: 'confirmed',
  },

  // July events
  {
    id: '16',
    summary: 'Independence Day',
    startDate: '2026-07-04',
    endDate: '2026-07-05',
    colorId: '11', // Tomato
    status: 'confirmed',
  },
  {
    id: '17',
    summary: 'Beach Week',
    startDate: '2026-07-11',
    endDate: '2026-07-18',
    colorId: '2', // Sage
    status: 'confirmed',
  },
  {
    id: '18',
    summary: 'Company Retreat',
    startDate: '2026-07-13',
    endDate: '2026-07-15',
    colorId: '3', // Grape
    status: 'confirmed',
  },

  // August events
  {
    id: '19',
    summary: 'Back to School Prep',
    startDate: '2026-08-17',
    endDate: '2026-08-21',
    colorId: '5', // Banana
    status: 'confirmed',
  },
  {
    id: '20',
    summary: 'Last Summer Trip',
    startDate: '2026-08-22',
    endDate: '2026-08-30',
    colorId: '7', // Peacock
    status: 'tentative',
  },

  // September events
  {
    id: '21',
    summary: 'Labor Day Weekend',
    startDate: '2026-09-05',
    endDate: '2026-09-08',
    colorId: '9', // Blueberry
    status: 'confirmed',
  },
  {
    id: '22',
    summary: 'Fall Conference',
    startDate: '2026-09-14',
    endDate: '2026-09-18',
    colorId: '6', // Tangerine
    status: 'confirmed',
  },

  // October events
  {
    id: '23',
    summary: 'Columbus Day',
    startDate: '2026-10-12',
    endDate: '2026-10-13',
    colorId: '8', // Graphite
    status: 'confirmed',
  },
  {
    id: '24',
    summary: 'Halloween Week',
    startDate: '2026-10-26',
    endDate: '2026-11-01',
    colorId: '6', // Tangerine
    status: 'confirmed',
  },

  // November events
  {
    id: '25',
    summary: 'Thanksgiving Break',
    description: 'Family gathering at grandparents',
    startDate: '2026-11-25',
    endDate: '2026-11-30',
    colorId: '5', // Banana
    status: 'confirmed',
  },
  {
    id: '26',
    summary: 'Black Friday Shopping',
    startDate: '2026-11-27',
    endDate: '2026-11-28',
    colorId: '11', // Tomato
    status: 'confirmed',
  },

  // December events
  {
    id: '27',
    summary: 'Holiday Season',
    description: 'Christmas and New Year celebrations',
    startDate: '2026-12-20',
    endDate: '2027-01-03',
    colorId: '4', // Flamingo
    status: 'confirmed',
  },
  {
    id: '28',
    summary: 'Christmas Eve & Day',
    startDate: '2026-12-24',
    endDate: '2026-12-26',
    colorId: '2', // Sage
    status: 'confirmed',
  },
  {
    id: '29',
    summary: 'New Year\'s Eve',
    startDate: '2026-12-31',
    endDate: '2027-01-01',
    colorId: '3', // Grape
    status: 'confirmed',
  },

  // Multi-day event spanning multiple weeks for testing
  {
    id: '30',
    summary: 'Q1 Planning Period',
    description: 'Annual planning and goal setting',
    startDate: '2026-01-12',
    endDate: '2026-01-30',
    colorId: '10', // Basil
    status: 'confirmed',
  },
]

