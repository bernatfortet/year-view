import type { CalendarEvent } from '../components/calendar/types'
import type { GoogleCalendar } from '../routes/api/calendar/list'

// Mock calendar IDs
const PERSONAL_CAL_ID = 'demo-personal'
const WORK_CAL_ID = 'demo-work'
const SCHOOL_CAL_ID = 'demo-school'

/**
 * Mock calendars for demo mode
 * These match the GoogleCalendar type from the API
 */
export const demoCalendars: GoogleCalendar[] = [
  {
    id: PERSONAL_CAL_ID,
    summary: 'Personal',
    backgroundColor: '#dc2127', // Tomato
    foregroundColor: '#ffffff',
    accessRole: 'owner',
    primary: true,
    selected: true,
  },
  {
    id: WORK_CAL_ID,
    summary: 'Work',
    backgroundColor: '#5484ed', // Blueberry
    foregroundColor: '#ffffff',
    accessRole: 'owner',
    selected: true,
  },
  {
    id: SCHOOL_CAL_ID,
    summary: 'School Calendar',
    backgroundColor: '#e1e1e1', // Graphite
    foregroundColor: '#000000',
    accessRole: 'reader',
    selected: true,
  },
]

/**
 * Demo events for 2026 - a realistic US calendar with holidays, school events, and trips
 */
export const demoEvents: CalendarEvent[] = [
  // ============================================
  // US FEDERAL HOLIDAYS (Personal calendar)
  // ============================================
  {
    id: 'holiday-new-years',
    summary: "New Year's Day",
    startDate: '2026-01-01',
    endDate: '2026-01-02',
    colorId: '11', // Tomato
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'holiday-mlk',
    summary: 'Martin Luther King Jr. Day',
    startDate: '2026-01-19',
    endDate: '2026-01-20',
    colorId: '11',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'holiday-presidents',
    summary: "Presidents' Day",
    startDate: '2026-02-16',
    endDate: '2026-02-17',
    colorId: '11',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'holiday-memorial',
    summary: 'Memorial Day',
    startDate: '2026-05-25',
    endDate: '2026-05-26',
    colorId: '11',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'holiday-juneteenth',
    summary: 'Juneteenth',
    startDate: '2026-06-19',
    endDate: '2026-06-20',
    colorId: '11',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'holiday-july4',
    summary: 'Independence Day',
    startDate: '2026-07-04',
    endDate: '2026-07-05',
    colorId: '11',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'holiday-labor',
    summary: 'Labor Day',
    startDate: '2026-09-07',
    endDate: '2026-09-08',
    colorId: '11',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'holiday-columbus',
    summary: 'Columbus Day',
    startDate: '2026-10-12',
    endDate: '2026-10-13',
    colorId: '11',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'holiday-veterans',
    summary: 'Veterans Day',
    startDate: '2026-11-11',
    endDate: '2026-11-12',
    colorId: '11',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'holiday-thanksgiving',
    summary: 'Thanksgiving',
    startDate: '2026-11-26',
    endDate: '2026-11-27',
    colorId: '11',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'holiday-christmas',
    summary: 'Christmas Day',
    startDate: '2026-12-25',
    endDate: '2026-12-26',
    colorId: '11',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },

  // ============================================
  // SCHOOL CALENDAR EVENTS (School calendar)
  // ============================================
  {
    id: 'school-winter-break',
    summary: 'Winter Break - No School',
    description: 'School closed for winter holidays',
    startDate: '2026-01-01',
    endDate: '2026-01-05',
    colorId: '8', // Graphite
    status: 'confirmed',
    calendarId: SCHOOL_CAL_ID,
  },
  {
    id: 'school-mlk-day',
    summary: 'MLK Day - No School',
    startDate: '2026-01-19',
    endDate: '2026-01-20',
    colorId: '8',
    status: 'confirmed',
    calendarId: SCHOOL_CAL_ID,
  },
  {
    id: 'school-presidents-day',
    summary: "Presidents' Day - No School",
    startDate: '2026-02-16',
    endDate: '2026-02-17',
    colorId: '8',
    status: 'confirmed',
    calendarId: SCHOOL_CAL_ID,
  },
  {
    id: 'school-teacher-workday-feb',
    summary: 'Teacher Workday - No School',
    startDate: '2026-02-27',
    endDate: '2026-02-28',
    colorId: '8',
    status: 'confirmed',
    calendarId: SCHOOL_CAL_ID,
  },
  {
    id: 'school-spring-break',
    summary: 'Spring Break - No School',
    description: 'One week spring break',
    startDate: '2026-04-06',
    endDate: '2026-04-11',
    colorId: '8',
    status: 'confirmed',
    calendarId: SCHOOL_CAL_ID,
  },
  {
    id: 'school-memorial-day',
    summary: 'Memorial Day - No School',
    startDate: '2026-05-25',
    endDate: '2026-05-26',
    colorId: '8',
    status: 'confirmed',
    calendarId: SCHOOL_CAL_ID,
  },
  {
    id: 'school-last-day',
    summary: 'Last Day of School',
    startDate: '2026-06-12',
    endDate: '2026-06-13',
    colorId: '8',
    status: 'confirmed',
    calendarId: SCHOOL_CAL_ID,
  },
  {
    id: 'school-summer-break',
    summary: 'Summer Break',
    description: 'School out for summer',
    startDate: '2026-06-13',
    endDate: '2026-08-24',
    colorId: '8',
    status: 'confirmed',
    calendarId: SCHOOL_CAL_ID,
  },
  {
    id: 'school-first-day',
    summary: 'First Day of School',
    startDate: '2026-08-24',
    endDate: '2026-08-25',
    colorId: '8',
    status: 'confirmed',
    calendarId: SCHOOL_CAL_ID,
  },
  {
    id: 'school-labor-day',
    summary: 'Labor Day - No School',
    startDate: '2026-09-07',
    endDate: '2026-09-08',
    colorId: '8',
    status: 'confirmed',
    calendarId: SCHOOL_CAL_ID,
  },
  {
    id: 'school-teacher-workday-oct',
    summary: 'Teacher Workday - No School',
    startDate: '2026-10-16',
    endDate: '2026-10-17',
    colorId: '8',
    status: 'confirmed',
    calendarId: SCHOOL_CAL_ID,
  },
  {
    id: 'school-thanksgiving-break',
    summary: 'Thanksgiving Break - No School',
    startDate: '2026-11-23',
    endDate: '2026-11-28',
    colorId: '8',
    status: 'confirmed',
    calendarId: SCHOOL_CAL_ID,
  },
  {
    id: 'school-winter-break-dec',
    summary: 'Winter Break - No School',
    description: 'School closed for winter holidays',
    startDate: '2026-12-21',
    endDate: '2027-01-04',
    colorId: '8',
    status: 'confirmed',
    calendarId: SCHOOL_CAL_ID,
  },

  // ============================================
  // INTERNATIONAL TRIPS (Personal calendar - Peacock)
  // ============================================
  {
    id: 'trip-europe-summer',
    summary: 'Europe Trip - Italy & France',
    description: 'Two week summer vacation: Rome, Florence, Paris',
    startDate: '2026-06-20',
    endDate: '2026-07-05',
    colorId: '7', // Peacock
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'trip-ski-christmas',
    summary: 'Colorado Ski Trip',
    description: 'Christmas ski vacation in Aspen',
    startDate: '2026-12-26',
    endDate: '2027-01-02',
    colorId: '7',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },

  // ============================================
  // LONG WEEKEND TRIPS (Personal calendar - Sage)
  // ============================================
  {
    id: 'trip-presidents-weekend',
    summary: 'Cabin Getaway',
    description: "Presidents' Day weekend at the cabin",
    startDate: '2026-02-14',
    endDate: '2026-02-17',
    colorId: '2', // Sage
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'trip-memorial-lake',
    summary: 'Lake House Weekend',
    description: 'Memorial Day at the lake house',
    startDate: '2026-05-23',
    endDate: '2026-05-26',
    colorId: '2',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'trip-labor-beach',
    summary: 'Beach Weekend',
    description: 'Labor Day at the beach',
    startDate: '2026-09-05',
    endDate: '2026-09-08',
    colorId: '2',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'trip-thanksgiving-family',
    summary: 'Thanksgiving at Grandparents',
    description: 'Extended family gathering',
    startDate: '2026-11-25',
    endDate: '2026-11-30',
    colorId: '2',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },

  // ============================================
  // WEEKEND CAR TRIPS (Personal calendar - Tangerine)
  // ============================================
  {
    id: 'trip-wine-country',
    summary: 'Wine Country Weekend',
    description: 'Napa Valley wine tasting',
    startDate: '2026-03-14',
    endDate: '2026-03-16',
    colorId: '6', // Tangerine
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'trip-national-park-apr',
    summary: 'Yosemite Weekend',
    description: 'Spring hiking trip',
    startDate: '2026-04-18',
    endDate: '2026-04-20',
    colorId: '6',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'trip-coast-may',
    summary: 'Coastal Road Trip',
    description: 'Pacific Coast Highway drive',
    startDate: '2026-05-09',
    endDate: '2026-05-11',
    colorId: '6',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'trip-camping-aug',
    summary: 'Camping Trip',
    description: 'Weekend camping in the mountains',
    startDate: '2026-08-01',
    endDate: '2026-08-03',
    colorId: '6',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'trip-fall-foliage',
    summary: 'Fall Foliage Drive',
    description: 'Scenic autumn drive',
    startDate: '2026-10-17',
    endDate: '2026-10-19',
    colorId: '6',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },

  // ============================================
  // WORK EVENTS (Work calendar - Blueberry)
  // ============================================
  {
    id: 'work-offsite-q1',
    summary: 'Q1 Team Offsite',
    description: 'Quarterly planning offsite in Austin',
    startDate: '2026-01-14',
    endDate: '2026-01-16',
    colorId: '9', // Blueberry
    status: 'confirmed',
    calendarId: WORK_CAL_ID,
  },
  {
    id: 'work-conference-mar',
    summary: 'Tech Conference',
    description: 'Annual industry conference',
    startDate: '2026-03-23',
    endDate: '2026-03-26',
    colorId: '9',
    status: 'confirmed',
    calendarId: WORK_CAL_ID,
  },
  {
    id: 'work-offsite-q2',
    summary: 'Q2 Team Offsite',
    description: 'Mid-year team building in Denver',
    startDate: '2026-04-22',
    endDate: '2026-04-24',
    colorId: '9',
    status: 'confirmed',
    calendarId: WORK_CAL_ID,
  },
  {
    id: 'work-summit-jun',
    summary: 'Company Summit',
    description: 'All-hands company summit',
    startDate: '2026-06-08',
    endDate: '2026-06-11',
    colorId: '9',
    status: 'confirmed',
    calendarId: WORK_CAL_ID,
  },
  {
    id: 'work-offsite-q3',
    summary: 'Q3 Team Offsite',
    description: 'Strategy planning in Seattle',
    startDate: '2026-07-15',
    endDate: '2026-07-17',
    colorId: '9',
    status: 'confirmed',
    calendarId: WORK_CAL_ID,
  },
  {
    id: 'work-training-sep',
    summary: 'Training Workshop',
    description: 'Professional development workshop',
    startDate: '2026-09-14',
    endDate: '2026-09-16',
    colorId: '9',
    status: 'confirmed',
    calendarId: WORK_CAL_ID,
  },
  {
    id: 'work-conference-oct',
    summary: 'Industry Summit',
    description: 'Fall industry conference',
    startDate: '2026-10-05',
    endDate: '2026-10-08',
    colorId: '9',
    status: 'confirmed',
    calendarId: WORK_CAL_ID,
  },
  {
    id: 'work-offsite-q4',
    summary: 'Q4 Team Offsite',
    description: 'Year-end planning in NYC',
    startDate: '2026-11-04',
    endDate: '2026-11-06',
    colorId: '9',
    status: 'confirmed',
    calendarId: WORK_CAL_ID,
  },

  // ============================================
  // FAMILY EVENTS (Personal calendar - Flamingo)
  // ============================================
  {
    id: 'family-birthday-kid',
    summary: "Emma's Birthday Party",
    description: 'Birthday celebration at the park',
    startDate: '2026-02-21',
    endDate: '2026-02-22',
    colorId: '4', // Flamingo
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'family-mothers-day',
    summary: "Mother's Day Brunch",
    startDate: '2026-05-10',
    endDate: '2026-05-11',
    colorId: '4',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'family-fathers-day',
    summary: "Father's Day BBQ",
    startDate: '2026-06-21',
    endDate: '2026-06-22',
    colorId: '4',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'family-reunion',
    summary: 'Family Reunion',
    description: 'Annual family reunion',
    startDate: '2026-07-25',
    endDate: '2026-07-27',
    colorId: '4',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'family-anniversary',
    summary: 'Wedding Anniversary',
    startDate: '2026-09-19',
    endDate: '2026-09-20',
    colorId: '4',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'family-halloween',
    summary: 'Halloween Party',
    description: 'Neighborhood Halloween party',
    startDate: '2026-10-31',
    endDate: '2026-11-01',
    colorId: '4',
    status: 'confirmed',
    calendarId: PERSONAL_CAL_ID,
  },

  // ============================================
  // TENTATIVE EVENTS
  // ============================================
  {
    id: 'tentative-spring-trip',
    summary: 'Spring Break Trip (Maybe)',
    description: 'Considering a trip during spring break',
    startDate: '2026-04-06',
    endDate: '2026-04-11',
    colorId: '1', // Lavender
    status: 'tentative',
    calendarId: PERSONAL_CAL_ID,
  },
  {
    id: 'tentative-july-vacation',
    summary: 'July Vacation (TBD)',
    description: 'Potential extended vacation',
    startDate: '2026-07-18',
    endDate: '2026-07-26',
    colorId: '1',
    status: 'tentative',
    calendarId: PERSONAL_CAL_ID,
  },
]
