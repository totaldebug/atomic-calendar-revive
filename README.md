# atomic calendar card v0.6.0
Advanced (experimental) calendar card for Home Assistant with Lovelace

It is my custom calendar card with advanced settings. It loads calendar events from Home Assistant calendar component.

The most important features:
- Show time of events in a different way (dates, hours)
- Custom colors and settings for different calendars, custom font sizes, colors of every text and line
- Move today's completed events up and dim them
- Show progress bar before the next event
- No need to load external libraries
- Translations included

TODO:
- event progress
- lot of fixes and improvements

The component should not work slower than other calendars, the bottleneck is the download of data from Google calendar.

![Preview](https://user-images.githubusercontent.com/11677097/52900547-78825000-31f7-11e9-926b-50589c3ddf64.jpg) 
![Preview](https://user-images.githubusercontent.com/11677097/52900557-a23b7700-31f7-11e9-9628-89293d4ee2fe.jpg)

## Install
1. Download `atomic-calendar.js` file to `/www` directory in your Home Assistant - [latest release](https://github.com/atomic7777/atomic_calendar/releases/download/v0.5.9/atomic-calendar.js)
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


### Text colors and fonts
| Name | Type | Since | Description |
|------|:----:|:-----:|-------------|
| dateColor | string | v0.3.0 | `default text color` Color of date (left side)
| dateSize | integer | v0.3.0 | `90` Date text size (percent of default font)
| timeColor | string | v0.3.0 | `default color` Color of time (under the event title)
| timeSize | integer | v0.3.0 | `90` Time text size (percent of default font)
| titleColor | string | v0.3.0 | `default text color` Color of event title
| titleSize | integer | v0.3.0 | `100` Event title text size (percent of default font)
| locationLinkColor | string | v0.3.0 | `default text color` Color of location link (right side)
| locationTextSize | integer | v0.3.0 | `90` Location text size (percent of default font)
| locationIconColor | string | v0.3.0 | `rgb(230, 124, 115)` Color of location icon
| dimFinishedEvents | boolean | v0.3.0 | `true` Apply filters to finished events (configured below)
| finishedEventOpacity | float | v0.3.0 | `0.6` Opacity level of finished events
| finishedEventOpacity | string | v0.3.0 | `grayscale(100%)` additional css filter to of finished events (default - greyscale)
| dayWrapperLineColor | string | v0.3.0 | `default text color` Color of line - days separate

### Next event pointer (currently line with icon)
| Name | Type | Since | Description |
|------|:----:|:-----:|-------------|
| showCurrentEventLine | boolean | v0.3.0 | `false` Show line before next event. Don't enable when showProgressBar is true - will look bad
| eventBarColor | string | v0.3.0 | `default color` Color of line showing next event

### Event progress bar (line with icon)
| Name | Type | Since | Description |
|------|:----:|:-----:|-------------|
| showProgressBar | boolean | optional | v0.5.5 | `true` Show event progress with moving icon. Don't enable when showCurrentEventLine - will look bad
| progressBarColor | string | v0.5.5 | `default color` Color of progress bar


## Configuration examples

Simple configuration:
```yaml
          - type: "custom:atomic-calendar"
            title: "Kalendarz"
            entities:
            - entity: calendar.kalendarz_dom
              color: red
            - calendar.atomic7777
              
```

Advanced config with all options, colors changed and progress bar enabled:
```yaml
          - type: "custom:atomic-calendar"
            title: "Calendar"
            entities:
            - entity: calendar.YOUR_CALENDARS_HERE
            fullDayEventText: 'All day'
            untilText: 'Until'
            showColors: true
            maxDaysToShow: 7
            showLocation: true
            showMonth: false
            showCurrentEventLine: false
            dateColor: black
            dateSize: 90
            timeColor: blue
            timeSize: 90
            titleColor: black
            titleSize: 100
            locationIconColor: 'rgb(230, 124, 115)'
            locationLinkColor: black
            locationTextSize: 90
            dimFinishedEvents: true
            finishedEventOpacity: 0.6
            finishedEventFilter: 'grayscale(100%)'
            dayWrapperLineColor: black
            eventBarColor: blue
            showProgressBar: true
            progressBarColor: blue
```
