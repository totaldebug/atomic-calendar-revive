---
layout: default
title: Calendar Mode
parent: Config Examples
nav_order: 2
---

# Calendar Mode

The second mode of view - calendar mode - Shows the full month calendar with simple events icons or colors, for the most important, infrequent events, like holiday or birthday.
You can change the mode by clicking the card name, or even make it the default view.
To make it work correctly you need to get more events than default 5 - you need to follow instruction [here](/quickstart#Show-more-than-5-events) for this, and setup it for 20-30 events at least.

There are four configurable possibilities for showing events occurring any day:

- day number color - for example "14" will be red for Valentine's Day
- Icon1 - will show any mdi icon under date, like birthday (default: gift icon)
- Icon2 - like above, just any other type of event (default: home icon)
- Icon3 - like above (default: star icon)

If you want to use any calendar's events, you have to add one or more of types:

```yaml
calEventIcon1Filter: bills,waste # only events with those words will be shown
calEventIcon2Filter: cleaning # only events with those words will be shown
entities:
  - entity: calendar.YOUR_CALENDAR_HERE # no type, it won't be shown in calendar mode
  - type: holiday # events from this calendar will be red
    entity: calendar.YOUR_CALENDAR1_HERE
  - type: icon1,icon2 # will show icon1 and icon2, but with filters configured above
    entity: calendar.home_events
  - type: icon3 # icon1 has no filters, show all events from this calendar
    entity: calendar.birthday
```

```yaml
entities:
  - entity: calendar.YOUR_CALENDAR_HERE
    type: holiday # events from this calendar will be red
  - entity: calendar.YOUR_CALENDAR1_HERE
    type: icon2,icon3 # will show icon2 and icon3, but with filters configured below
  - entity: calendar.birthday
    type: icon1 # Icon1 has no filters, show all events from this calendar
  - entity: calendar.YOUR_CALENDAR2_HERE # no type, it won't be shown in calendar mode
calEventIcon1Filter: bills,waste # only events with those words will be shown
calEventIcon2Filter: cleaning # only events with those words will be shown
```

If you set filters (keywords) for any type, it will show an icon only when event summary contains one of keywords. If you don't set any filter, it will show icons for all days with any events.
