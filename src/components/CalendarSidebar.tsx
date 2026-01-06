import { RefreshCwIcon, SlidersHorizontalIcon } from "lucide-react"
import { useStore } from "@nanostores/react"

import { useAuth } from "@/context/AuthContext"
import { useCalendars } from "@/context/CalendarContext"
import { triggerEventsRefresh, $isSyncingEvents } from "@/stores/events.store"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import type { GoogleCalendar } from "@/routes/api/calendar/list"

interface CalendarsByAccount {
  email: string
  calendars: GoogleCalendar[]
}

export function CalendarSidebar() {
  const { user, isAuthenticated, signOut, signIn } = useAuth()
  const {
    calendars,
    selectedCalendarIds,
    isLoadingCalendars,
    error,
    toggleCalendar,
    refreshCalendars,
  } = useCalendars()

  const isSyncing = useStore($isSyncingEvents)

  const calendarsByAccount: CalendarsByAccount[] = user?.email
    ? [{ email: user.email, calendars }]
    : []

  function handleRefresh() {
    refreshCalendars()
    triggerEventsRefresh()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-lg font-semibold">Calendars</h2>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isSyncing || isLoadingCalendars}
        >
          <RefreshCwIcon className={isSyncing || isLoadingCalendars ? 'animate-spin' : ''} />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>

      <Separator />

      {/* Calendar List */}
      <div className="flex-1 overflow-auto px-2 py-2">
        {!isAuthenticated ? (
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              Sign in to view your calendars
            </p>

            <Button onClick={signIn} className="w-full">
              Sign in with Google
            </Button>
          </div>
        ) : error ? (
          <div className="p-4">
            <p className="text-sm text-destructive">{error}</p>

            <Button onClick={refreshCalendars} variant="outline" className="mt-2">
              Try again
            </Button>
          </div>
        ) : isLoadingCalendars && calendars.length === 0 ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-4 h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded flex-1" />
                <div className="w-3 h-3 bg-muted rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          calendarsByAccount.map((account) => (
            <div key={account.email} className="mb-4">
              {/* Account Header */}
              <div className="flex items-center justify-between px-2 py-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
                  {account.email}
                </span>

                <Button variant="ghost" size="icon-xs">
                  <SlidersHorizontalIcon />
                  <span className="sr-only">Calendar settings</span>
                </Button>
              </div>

              {/* Calendar Items */}
              <div className="space-y-0.5">
                {account.calendars.map((calendar) => (
                  <CalendarItem
                    key={calendar.id}
                    calendar={calendar}
                    isSelected={selectedCalendarIds.has(calendar.id)}
                    onToggle={() => toggleCalendar(calendar.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {isAuthenticated && (
        <div className="p-4 border-t">
          <Button variant="secondary" className="w-full" onClick={signOut}>
            Sign out
          </Button>
        </div>
      )}
    </div>
  )
}

interface CalendarItemProps {
  calendar: GoogleCalendar
  isSelected: boolean
  onToggle: () => void
}

function CalendarItem({ calendar, isSelected, onToggle }: CalendarItemProps) {
  return (
    <label className="flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer hover:bg-muted transition-colors">
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        className="data-checked:border-transparent"
        style={{
          backgroundColor: isSelected ? calendar.backgroundColor : undefined,
          borderColor: isSelected ? calendar.backgroundColor : undefined,
        }}
      />

      <span className="flex-1 text-sm truncate">
        {calendar.summary}
      </span>

      <span
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: calendar.backgroundColor }}
      />
    </label>
  )
}
