---
layout: default
title: Main Options
parent: Configuration Options
nav_order: 1
---

| Name                 |  Type   |   Default    |  Since  | Description                                                                                                                                              |
| -------------------- | :-----: | :----------: | :-----: | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type                 | string  | **required** | v0.3.0  | `custom:atomic-calendar-revive`                                                                                                                          |
| entities             |  list   | **required** | v0.3.0  | One or more calendars, configured in HA [Google Calendar Component][googlecalcomp]                                                                       |
| name                 | string  |   optional   | v0.12.0 | Card name.                                                                                                                                               |
| showColors           | boolean |   optional   | v0.3.0  | `true` Show colors in events, configured in entities list                                                                                                |
| maxDaysToShow        | integer |   optional   | v0.3.0  | `7` Maximum number of days to show; if set to zero will only display currently running events                                                            |
| maxEventCount        | integer |   optional   | v0.9.0  | `0` Maximum number of events to show; zero removes any limitation                                                                                        |
| showLocation         | boolean |   optional   | v0.3.0  | `true` Show location link (right side)                                                                                                                   |
| showMonth            | boolean |   optional   | v0.3.0  | `false` Show month under day (left side)                                                                                                                 |
| showWeekDay          | boolean |   optional   | v1.3.0  | `false` Show week day under day (left side)                                                                                                              |
| showLoader           | boolean |   optional   | v0.7.0  | `true` Show animation, when events are being loaded from Google Calendar.                                                                                |
| showDate             | boolean |   optional   | v0.7.2  | `false` Show the date on the right side of the card name                                                                                                 |
| startDaysAhead       | integer |   optional   | v0.7.3  | `0` If you set more than 0, events will be loaded starting `x` days from today. For example `1` - the component will show events starting from tomorrow. |
| showDescription      | boolean |   optional   | v0.8.4  | `false` Shows long description of event from Google Calendar.                                                                                            |
| showNoEventsForToday | boolean |   optional   | v0.8.6  | `false` Shows `No events for today` if no events, instead of omit the entry.                                                                             |
| sortByStartTime      | boolean |   optional   | v0.9.0  | `false` Sort events by start time first instead of grouping them by calendar.                                                                            |
| disableEventLink     | boolean |   optional   | v0.10.0 | `false` disables links in event title.                                                                                                                   |
| disableLocationLink  | boolean |   optional   | v0.10.0 | `false` disables links in event location.                                                                                                                |
| linkTarget           | string  |   optional   | v0.11.0 | `_blank` Allows custom target for links, default will open new tab.                                                                                      |
| showFullDayProgress  | string  |   optional   | v1.7.0  | `false` Enables the progress bar for full day events                                                                                                     |
| showDeclined         | boolean |   optional   | v2.0.0  | `false` show/hide events that have been declined                                                                                                         |
| defaultMode          | integer |   optional   | v2.0.0  | `Event` Set `Event` to make Events default mode, set `Calendar` to make Calendar mode default                                                            |

# Color Options

| Name                 |  Type   | Since  |                                     Description                                     |
| -------------------- | :-----: | :----: | :---------------------------------------------------------------------------------: |
| locationLinkColor    | string  | v0.3.0 |              `primary text color` Color of location link (right side)               |
| locationTextSize     | integer | v0.3.0 |                  `90` Location text size (percent of default font)                  |
| locationIconColor    | string  | v0.3.0 |                     `primary text color` Color of location icon                     |
| hideFinishedEvents   | boolean | v0.9.0 |                        `false` Don't display finished events                        |
| dimFinishedEvents    | boolean | v0.3.0 |             `true` Apply filters to finished events (configured below)              |
| finishedEventOpacity |  float  | v0.3.0 |                       `0.6` Opacity level of finished events                        |
| finishedEventFilter  | string  | v0.3.0 | `grayscale(100%)` additional css filter to of finished events (default - greyscale) |
| nameColor            | string  | v1.6.0 |                    `primary text color` Sets the card name color                    |

[googlecalcomp]: https://www.home-assistant.io/components/calendar.google/
