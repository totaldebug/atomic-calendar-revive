---
layout: default
title: Advanced Config
parent: Config Examples
nav_order: 3
---

# Advanced Config

## Advanced config with all options, colors changed and progress bar enabled:

```yaml
- type: "custom:atomic-calendar-revive"
  name: "Calendar"
  entities:
    - entity: calendar.YOUR_CALENDARS_HERE
      startTimeFilter: '10:00'
      endTimeFilter: '17:00'
  fullDayEventText: "All day"
  untilText: "Until"
  showColors: true
  maxDaysToShow: 7
  showLocation: true
  showMonth: false
  showCurrentEventLine: false
  dateColor: black
  dateSize: 90
  timeColor: blue
  timeSize: 90
  eventTitleColor: black
  eventTitleSize: 100
  locationIconColor: "rgb(230, 124, 115)"
  locationLinkColor: black
  locationTextSize: 90
  dimFinishedEvents: true
  finishedEventOpacity: 0.6
  finishedEventFilter: "grayscale(100%)"
  dayWrapperLineColor: black
  eventBarColor: blue
  showProgressBar: true
  progressBarColor: blue
```
