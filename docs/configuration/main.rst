.. _mainoptions:

############
Main Options
############

========================= ========= =============== ========== ==========================================================================================================================================================================================================================
 Name                      Type      Default         Since      Description
========================= ========= =============== ========== ==========================================================================================================================================================================================================================
 type                      string    **required**    v0.3.0     ``custom:atomic-calendar-revive``
 entities                  list      **required**    v0.3.0     One or more calendars, configured in HA [Google Calendar Component][googlecalcomp]
 name                      string    optional        v0.12.0    Card name.
 maxDaysToShow             integer   optional        v0.3.0     ``7`` Maximum number of days to show; if set to zero will only display currently running events
 maxEventCount             integer   optional        v0.9.0     ``0`` Maximum number of events to show; zero removes any limitation
 showLocation              boolean   optional        v0.3.0     ``true`` Show location link (right side)
 showMonth                 boolean   optional        v0.3.0     ``false`` Show month under day (left side)
 showWeekDay               boolean   optional        v1.3.0     ``false`` Show week day under day (left side)
 showLoader                boolean   optional        v0.7.0     ``true`` Show animation, when events are being loaded from Google Calendar.
 showDate                  boolean   optional        v0.7.2     ``false`` Show the date on the right side of the card name
 startDaysAhead            integer   optional        v0.7.3     ``0`` If you set more than 0, events will be loaded starting `x` days from today. For example `1` - the component will show events starting from tomorrow, if a negative number is used, events previous will be shown.
 showDescription           boolean   optional        v0.8.4     ``false`` Shows long description of event from Google Calendar.
 showNoEventsForToday      boolean   optional        v0.8.6     ``false`` Shows `No events for today` if no events, instead of omit the entry.
 sortByStartTime           boolean   optional        v0.9.0     ``false`` Sort events by start time first instead of grouping them by calendar.
 disableEventLink          boolean   optional        v0.10.0    ``false`` disables links in event title.
 disableLocationLink       boolean   optional        v0.10.0    ``false`` disables links in event location.
 linkTarget                string    optional        v0.11.0    ``_blank`` Allows custom target for links, default will open new tab.
 defaultMode               integer   optional        v2.0.0     ``Event`` Set `Event` to make Events default mode, set `Calendar` to make Calendar mode default
 refreshInterval           integer   optional        v2.1.0     ``60`` Set how often the calendar should refresh data in seconds
 showHours                 boolean   optional        v2.7.0     ``true`` shows when and event starts / ends
 showRelativeTime          boolean   optional        v2.7.0     ``true`` shows amount of time until event starts
 showPrivate               boolean   optional        v3.3.0     ``true`` show private events (only Google Calendar)
 showNoEventDays           boolean   optional        v4.1.0     ``false`` Shows days that have no events, instead of only showing event days
 descLength                integer   optional        v4.8.0     Sets the length of descriptions
 hideDuplicates            boolean   optional        v5.1.0     ``false`` Removes any duplicate items based on summary, start time and end time.
 hideDeclined              boolean   optional        v7.0.0     ``false`` show/hide events that have been declined
 showMultiDay              boolean   optional        v7.0.0     ``false`` if set true will show multi-day events on each day
 showMultiDayEventParts    boolean   optional        v7.0.0     ``false`` if set true will show how many days in event and which day it is
========================= ========= =============== ========== ==========================================================================================================================================================================================================================
