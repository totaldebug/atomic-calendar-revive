---
layout: default
title: 🚀 Quick Start
nav_order: 1
---

## 🚀 Quick Start

This quick start guide will take you through the easiest ways to get up and running. Please note that this quick start guide assumes you already have a calendar setup in Home Assistant, this card fully supports [Google Calendar](https://www.home-assistant.io/integrations/calendar.google/) and has support for [calDav](https://www.home-assistant.io/integrations/caldav/) although calDav doesn't have as many features.

## Installation

### HACS (recommended)

Install using `HACS` component:

1. You need HACS installed and configured
2. Go to plugins tab
3. Search for `Atomic Calendar Revive`
4. If you use the Lovelace Editor then first go to your user provile and enable Advanced Mode
5. Now add the follwoing to `Configuration -> Lovelace Dashboards -> Resources`

```yaml
/hacsfiles/atomic-calendar-revive/atomic-calendar-revive.js
```

7. If you edit your files directly, add the below to the `ui-lovelace.yaml` file:

```yaml
resources:
  - url: /hacsfiles/atomic-calendar-revive/atomic-calendar-revive.js
    type: module
```

### Manual

1. You need to have the [Google calendar](https://www.home-assistant.io/components/calendar.google/) component configured in Home Assistant.
2. Download `atomic-calendar-revive.js` file from the `dist` directory to `/www/community/atomic-calendar-revive/atomic-calendar-revive.js` directory in your Home Assistant - [latest release](https://github.com/marksie1988/atomic-calendar-revive/releases/latest)
3. If you use the Lovelace Editor then add the follwoing to Configuration -> Lovelace Dashboards -> Resources

```yaml
/local/community/atomic-calendar-revive/atomic-calendar-revive.js
```

4. If you edit your files directly, add the below to the `ui-lovelace.yaml` file :

```yaml
resources:
  - url: /local/community/atomic-calendar-revive/atomic-calendar-revive.js
    type: module
```

4. If you use Lovelace and want to use the editor, download the `atomic-calendar-revive-editor.js` to `/www/community/atomic-calendar-revive/`. (or the folder you used above)
6. Add the card to the UI using the GUI editor or to `ui-lovelace.yaml` with options, examples below
7. If you are upgrading, try to reload your browser cache by pressing ctrl-shift-r or shift-F5.
8. If you want to use `Calendar mode` follow the guide [here](#more-than-5), because by default HA only gets the 5 nearest events from Google Calendar.

## Show more than 5 events

In order to increase the amount of events that are shown you have to add `max_results` setting to `google_calendars.yaml` file

For calendar mode we recommend that this is set to at least 30

```yaml
- cal_id: xxxxxxxxxxxxxxxxxxxx@group.calendar.google.com
  entities:
  - device_id: calendar_id
    name: Calendar_name
    max_results: 30
```

## Configuration

For more configuration options check out [this section](https://marksie1988.github.io/atomic-calendar-revive/configurations.html)

### Simple configuration

Change `YOUR_CALENDAR_HERE` with the calendar, you can find the entity name in `developer tools -> states` you can search by typing `calendar` in the `entity` box.

```yaml
- type: "custom:atomic-calendar-revive"
  entities:
  - entity: calendar.YOUR_CALENDAR_HERE
    titleColor: red
    whitelist: 'word1,word2'
  - entity: calendar.YOUR_CALENDAR1_HERE
    blacklist: 'word1, word2'
```
