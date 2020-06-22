---
layout: default
title: Basic Config
parent: Config Examples
nav_order: 1
---

# Basic Configuration

This example is the most basic implementation, it will just show you a list of events

```yaml
- type: 'custom:atomic-calendar-revive'
  entities:
    - entity: calendar.YOUR_CALENDAR_HERE
```

![screenshot](../assets/img/screenshots/basic_config_example.png)

## With Name

```yaml
- type: 'custom:atomic-calendar-revive'
  name: 'My Calendar'
  entities:
    - entity: calendar.YOUR_CALENDAR_HERE
```

![screenshot](../assets/img/screenshots/basic_config_name_example.png)

## With Calendar Mode Enabled

```yaml
- type: 'custom:atomic-calendar-revive'
  name: 'My Calendar'
  entities:
    - entity: calendar.YOUR_CALENDAR_HERE
      icon: 'mdi:home-heart'
      color: 'red'
    - entity: calendar.YOUR_CALENDAR1_HERE
      icon: 'mdi:account-plus'
      color: 'blue'
    - entity: calendar.YOUR_CALENDAR2_HERE
      icon: 'mdi:account'
  enableModeChange: true
```

![screenshot](../assets/img/screenshots/basic_config_calendar_example.png)

### With both Events mode and Calendar mode, calendar is default

```yaml
- type: 'custom:atomic-calendar-revive'
  name: 'Calendar'
  enableModeChange: true
  defaultMode: 2
  entities:
    - entity: calendar.YOUR_CALENDAR_HERE
      icon: 'mdi:home-heart'
      color: 'red'
    - entity: calendar.YOUR_CALENDAR1_HERE
      icon: 'mdi:account-plus'
      color: 'blue'
    - entity: calendar.YOUR_CALENDAR2_HERE
      icon: 'mdi:account'
```
