# atomic_calendar
Advanced (experimental) calendar card for Home Assistant with Lovelace

It is my custom calendar card with advanced settings. It loads calendar events from Home Assistant calendar component.

The most important features:
- Show time of events in a different way (dates, hours)
- Custom colors and settings for different calendars, custom font sizes, colors of every text and line
- Move today's completed events up and dim them
- Show progress bar before the next event

The component should not work slower than other calendars, the bottleneck is the download of data from Google calendar.

## Install
1. Download `atomic-calendar.js` file to `/www` directory in your Home Assistant - [latest release](https://github.com/atomic7777/atomic_calendar/blob/master/atomic-calendar.js)
2. Add this reference to your `ui-lovelace.yaml` file:
  ```yaml
  resources:
    - url: /local/atomic-calendar.js?v=0.3.1
      type: module
  ```
3. Add card with options to `ui-lovelace.yaml`

## Options
### Main settings

| Name | Type | Default | Since | Description |
|------|:----:|:-------:|:-----:|-------------|
| type | string | **required** | v0.3.0 | `custom:atomic-calendar`
| entities | list | **required** | v0.3.0 | One or more calendars, configured in HA [Google Calendar component](https://www.home-assistant.io/components/calendar.google/)
| title | string | optional | v0.3.0 | `Calendar` Calendar title
| untilText | string | optional | v0.3.0 | `Until` Custom translation of `Until` text
| showColors | string | optional | v0.3.0 | `true` Show colors in events, configured in entities list
| maxDaysToShow | integer | optional | v0.3.0 | `7` Maximum number of days to show
| showLocation | boolean | optional | v0.3.0 | `true` Show location link (right side)
| showMonth | boolean | optional | v0.3.0 | `false` Show month under day (left side)
| showCurrentEventLine | boolean | optional | v0.3.0 | `true` Show line before next event

### Colors, fonts

| Name | Type | Default | Since | Description |
|------|:----:|:-------:|:-----:|-------------|
| dateColor | string | optional | v0.3.0 | `default text color` Color of date (left side)
| dateSize | integer | optional | v0.3.0 | `90` Date text size (percent of default font)
| timeColor | string | optional | v0.3.0 | `default color` Color of time (under the event title)
| timeSize | integer | optional | v0.3.0 | `90` Time text size (percent of default font)
| titleColor | string | optional | v0.3.0 | `default text color` Color of event title
| titleSize | integer | optional | v0.3.0 | `100` Event title text size (percent of default font)
| locationLinkColor | string | optional | v0.3.0 | `default text color` Color of location link (right side)
| locationTextSize | integer | optional | v0.3.0 | `90` Location text size (percent of default font)
| locationIconColor | string | optional | v0.3.0 | `rgb(230, 124, 115)` Color of location icon
| dimFinishedEvents | boolean | optional | v0.3.0 | `true` Apply filters to finished events (configured below)
| finishedEventOpacity | float | optional | v0.3.0 | `0.6` Opacity level of finished events
| finishedEventOpacity | string | optional | v0.3.0 | `grayscale(100%)` additional css filter to of finished events (default - greyscale)
| dayWrapperLineColor | string | optional | v0.3.0 | `default text color` Color of line - days separate
| progressBarColor | string | optional | v0.3.0 | `default color` Color of line showing next event



## Configuration examples

```yaml
          - type: "custom:atomic-calendar"
            title: "Kalendarz"
            entities:
            - entity: calendar.kalendarz_dom
              color: red
            - calendar.atomic7777
              
```
