---
layout: default
title: Main Options
parent: Configuration Options
nav_order: 1
---

| Name | Type | Default | Since | Description |
|------|:----:|:-------:|:-----:|-------------|
| type | string | **required** | v0.3.0 | `custom:atomic-calendar`
| entities | list | **required** | v0.3.0 | One or more calendars, configured in HA [Google Calendar component](https://www.home-assistant.io/components/calendar.google/)
| name | string | optional | v0.12.0 | Card name.
| showColors | boolean | optional | v0.3.0 | `true` Show colors in events, configured in entities list
| maxDaysToShow | integer | optional | v0.3.0 | `7` Maximum number of days to show; if set to zero will only display currently running events
| maxEventCount | integer | optional | v0.9.0 | `0` Maximum number of events to show; zero removes any limitation
| showLocation | boolean | optional | v0.3.0 | `true` Show location link (right side)
| showMonth | boolean | optional | v0.3.0 | `false` Show month under day (left side)
| showLoader | boolean | optional | v0.7.0 | `true` Show animation, when events are being loaded from Google Calendar.
| showDate | boolean | optional | v0.7.2 | `false` Show the date on the right side of the card name
| startDaysAhead | integer | optional | v0.7.3 | `0` If you set more than 0, events will be loaded starting `x` days from today. For example `1` - the component will show events starting from tomorrow.
| showDescription | boolean | optional | v0.8.4 | `false` Shows long description of event from Google Calendar.
| showNoEventsForToday | boolean | optional | v0.8.6 | `false` Shows `No events for today` if no events, instead of omit the entry.
| sortByStartTime | boolean | optional | v0.9.0 | `false` Sort events by start time first instead of grouping them by calendar.
| disableEventLink | boolean | optional | v0.10.0 | `false` disables links in event title.
| disableLocationLink | boolean | optional | v0.10.0 | `false` disables links in event location.
| linkTarget | string | optional | v0.11.0 | `_blank` Allows custom target for links, default will open new tab.
