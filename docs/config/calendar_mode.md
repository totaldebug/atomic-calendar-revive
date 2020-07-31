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

Any events that you want to have displayed on the calendar you should assign an icon, optionally you can set a color which will display this in a different color.

If you want to have multiple icons for a calendar simply duplicate the entity and have different whitelists

If you want to use any calendar's events, you have to add one or more of types:

```yaml
entities:
  - entity: calendar.YOUR_CALENDAR_HERE # no icon, it won't be shown in calendar mode
  - entity: calendar.YOUR_CALENDAR1_HERE
    icon: 'mdi:palm-tree' # events from this calendar will have a palm tree icon
    color: 'red' # events from this calendar will be red
  - entity: calendar.home_events
    icon: 'mdi:home-heart' # will show icon but only for events with "family" in the title
    whitelist: family
```

If you set a whitelist (keywords) for any entity, it will show an icon only when event summary contains one of the keywords. If you don't set any filter, it will show icons for all days with any events.
