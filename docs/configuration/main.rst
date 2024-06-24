.. _mainoptions:

############
Main Options
############

========================= ========= =============== ==========================================================================================================================================================================================================================
 Name                      Type      Default         Description
========================= ========= =============== ==========================================================================================================================================================================================================================
 type                      string    **required**    ``custom:atomic-calendar-revive``
 entities                  list      **required**    One or more calendars, configured in HA [Google Calendar Component][googlecalcomp]
 name                      string    optional        Card name.
 maxDaysToShow             integer   optional        ``7`` Maximum number of days to show; if set to zero will only display currently running events
 maxEventCount             integer   optional        ``0`` Maximum number of events to show; zero removes any limitation
 showLocation              boolean   optional        ``true`` Show location link (right side)
 showMonth                 boolean   optional        ``false`` Show month under day (left side)
 showLoader                boolean   optional        ``true`` Show animation, when events are being loaded from Google Calendar.
 showDate                  boolean   optional        ``false`` Show the date on the right side of the card name
 startDaysAhead            integer   optional        ``0`` If you set more than 0, events will be loaded starting `x` days from today. For example `1` - the component will show events starting from tomorrow, if a negative number is used, events previous will be shown.
 showDescription           boolean   optional        ``false`` Shows long description of event from Google Calendar.
 showNoEventsForToday      boolean   optional        ``false`` Shows `No events for today` if no events, instead of omit the entry.
 sortBy                    boolean   optional        ``start`` Sort events by start time. ``start|milestone|none``
 disableEventLink          boolean   optional        ``false`` disables links in event title.
 disableLocationLink       boolean   optional        ``false`` disables links in event location.
 linkTarget                string    optional        ``_blank`` Allows custom target for links, default will open new tab.
 defaultMode               integer   optional        ``Event`` Set `Event` to make Events default mode, set `Calendar` to make Calendar mode default
 refreshInterval           integer   optional        ``60`` Set how often the calendar should refresh data in seconds
 showHours                 boolean   optional        ``true`` shows when and event starts / ends
 showRelativeTime          boolean   optional        ``true`` shows amount of time until event starts
 showPrivate               boolean   optional        ``true`` show private events (only Google Calendar)
 showNoEventDays           boolean   optional        ``false`` Shows days that have no events, instead of only showing event days
 descLength                integer   optional        Sets the length of descriptions
 hideDuplicates            boolean   optional        ``false`` Removes any duplicate items based on summary, start time and end time.
 showDeclined              boolean   optional        ``false`` show/hide events that have been declined
 showMultiDay              boolean   optional        ``false`` if set true will show multi-day events on each day
 showMultiDayEventParts    boolean   optional        ``false`` if set true will show how many days in event and which day it is
 hideFinishedEvents        boolean   optional        ``false`` if set true will hide any finished events
 eventTitle                string    optional        Where no event title exists, add this string instead, Will add globally unless entity.eventTitle is set.
 compactMode               boolean   optional        ``false`` if set true will squash text down to allow for much more compact design
 language                  string    optional        Not recommended to use, but can set the language code e.g. "gb" / "es"
 titleLength               integer   optional        Sets the maximum length of the event titles
 showAllDayEvents          boolean   optional        ``true`` if set false will hide all events that are a full day
 offsetHeaderDate          boolean   optional        ``false`` if set true the header date will match the startDaysAhead offset date
 allDayBottom              boolean   optional        ``false`` if set true all day events will show below other running events
========================= ========= =============== ==========================================================================================================================================================================================================================
