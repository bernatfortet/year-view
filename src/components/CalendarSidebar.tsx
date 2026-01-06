import { RefreshCwIcon, SettingsIcon, SlidersHorizontalIcon } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { useCalendars } from "@/context/CalendarContext"
import { triggerEventsRefresh } from "@/stores/events.store"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
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

  // Group calendars by account (owner email)
  const calendarsByAccount: CalendarsByAccount[] = user?.email
    ? [{ email: user.email, calendars }]
    : []

  const handleRefresh = () => {
    refreshCalendars()
    triggerEventsRefresh()
  }

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border bg-background">
      {/* Header */}
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Calendars</h2>

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoadingCalendars}
            >
              <RefreshCwIcon className={isLoadingCalendars ? 'animate-spin' : ''} />
              <span className="sr-only">Refresh calendars</span>
            </Button>

            <Button variant="ghost" size="icon">
              <SettingsIcon />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
      </SidebarHeader>

      <Separator className="bg-sidebar-border" />

      {/* Calendar List */}
      <SidebarContent className="px-2 py-2">
        {!isAuthenticated ? (
          <SidebarGroup>
            <SidebarGroupContent className="p-4">
              <p className="text-sm text-sidebar-foreground/70 mb-4">
                Sign in to view your calendars
              </p>

              <Button onClick={signIn} className="w-full">
                Sign in with Google
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : error ? (
          <SidebarGroup>
            <SidebarGroupContent className="p-4">
              <p className="text-sm text-destructive">{error}</p>

              <Button onClick={refreshCalendars} variant="outline" className="mt-2">
                Try again
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : isLoadingCalendars && calendars.length === 0 ? (
          <SidebarGroup>
            <SidebarGroupContent className="p-4">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-4 h-4 bg-sidebar-accent rounded" />
                    <div className="h-4 bg-sidebar-accent rounded flex-1" />
                    <div className="w-3 h-3 bg-sidebar-accent rounded-full" />
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          calendarsByAccount.map((account) => (
            <SidebarGroup key={account.email}>
              {/* Account Header */}
              <div className="flex items-center justify-between px-2 py-2">
                <span className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wide">
                  {account.email}
                </span>

                <Button variant="ghost" size="icon-xs">
                  <SlidersHorizontalIcon />
                  <span className="sr-only">Calendar settings</span>
                </Button>
              </div>

              {/* Calendar Items */}
              <SidebarGroupContent>
                <SidebarMenu>
                  {account.calendars.map((calendar) => (
                    <SidebarMenuItem key={calendar.id}>
                      <CalendarItem
                        calendar={calendar}
                        isSelected={selectedCalendarIds.has(calendar.id)}
                        onToggle={() => toggleCalendar(calendar.id)}
                      />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}

      </SidebarContent>

      {/* Footer */}
      {isAuthenticated && (
        <SidebarFooter className="p-4">
          <Button variant="secondary" className="w-full" onClick={signOut}>
            Sign out
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}

interface CalendarItemProps {
  calendar: GoogleCalendar
  isSelected: boolean
  onToggle: () => void
}

function CalendarItem({ calendar, isSelected, onToggle }: CalendarItemProps) {
  return (
    <label className="flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer hover:bg-sidebar-accent transition-colors group">
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        className="data-checked:border-transparent"
        style={{
          backgroundColor: isSelected ? calendar.backgroundColor : undefined,
          borderColor: isSelected ? calendar.backgroundColor : undefined,
        }}
      />

      <span className="flex-1 text-sm text-sidebar-foreground truncate">
        {calendar.summary}
      </span>

      <span
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: calendar.backgroundColor }}
      />
    </label>
  )
}
