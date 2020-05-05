# Atomic Calendar Revive v1.3.0
An advanced calendar card for Home Assistant with Lovelace. (fixed to work with HA v106+)

**If you already have Atomic Calendar Revive installed, please check the Releases Change Log before upgrading, there have been some breaking changes since I took on this development.**


[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

[![Known Issues][issues-shield]][issues]
![Project Maintenance][maintenance-shield]
[![GitHub Activity][commits-shield]][commits]

[![Discord][discord-shield]][discord]

## Support

Hey dude! Help me out for a couple of :beers: or a :coffee:!

[![coffee](https://www.buymeacoffee.com/assets/img/custom_images/black_img.png)](https://www.buymeacoffee.com/marksie1988)


## About

Atomic Calendar Revive is an updated version of the card originally created by atomic7777.

This calendar card includes advanced settings that allow much more flexibility than other cards.

It loads calendar events from Home Assistant - Google calendar component.

It contains two types of views: `Events mode` and `Calendar mode`. You can switch or select the default one.

New features that are only in Revive:
- Added more appealing UI Look
- Added the ability to display calendar names
- Added keyword whitelists
- Added linkTarget option to allow selecting specific action when clicking link
- Added ability to disable Event and Location Links
- Added first version of Lovelace UI Editor (not all options are in yet)
- Merged PR that: Hides finished events, sorts events by start time, shows currently running events. allows limiting total number of events
- Resolved issue with 106 showing error: `Cannot assign to read only property '0' of object '[object Array]'`
- Multiple Bug Fixes

The most important features:
- No need to load external libraries (everything is included)
- Custom colors and settings for different calendars, custom font sizes, colors of every text and line
- All translations included, few of the words can be configured in settings
- Compatible with all day and multiple day events
- Fast switch between both modes, or make one of them default

* Event mode:
- Shows nearest events, one by one, day by day, time of events in a different way (dates, hours)
- Moves today's completed events up and dim them
- Highlights the next event, or show a progress bar
- Shows event location link
- Clicking on the event title will open a new window with Google Calendar (can be disabled)
- Clicking on Location will open a window with this location on Google Maps  (can be disabled)

* Calendar mode:
- Show a traditional calendar (a table with 42 days) with configurable events icons like holiday, birthday
- Quick overview of the following months
- You can set keywords to show only important things, like birthday

If you have any suggestions about design or functionality, please let me know by opening an issue

## Documentation

All documentation is now maintained [here](https://marksie1988.github.io/atomic-calendar-revive)

## Configuration

### Simple configuration:
```yaml
- type: "custom:atomic-calendar-revive"
  entities:
  - entity: calendar.YOUR_CALENDAR_HERE
    titleColor: red
    whitelist: 'word1,word2'
  - entity: calendar.YOUR_CALENDAR1_HERE
    blacklist: 'word1, word2'
```

### Advanced config with all options, colors changed and progress bar enabled:
```yaml
- type: "custom:atomic-calendar-revive"
  name: "Calendar"
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

### Simple configuration, both Events mode and Calendar mode, calendar is default:
```yaml
- type: "custom:atomic-calendar-revive"
  name: "Calendar"
  enableModeChange: true
  defaultMode: 2
  CalEventIcon1Filter: birthday
  CalEventIcon2Filter: waste,bills
  entities:
  - entity: calendar.YOUR_CALENDAR_HERE
    type: icon2
  - entity: calendar.YOUR_CALENDAR1_HERE
	  type: icon1,icon2
  - entity: calendar.YOUR_CALENDAR2_HERE
    type: holiday

```

### Calendar Mode
The second mode of view - calendar mode - is to show full month calendar with simple events icons or colors, for most important, infrequent events, like holiday or birthday.
You can change mode by clicking the card name, or even make it the default view.
To make it work correctly you need to get more events than default 5 - you need to follow instruction [here](#more-than-5) for this, and setup it for 20-30 events at least.

There are four configurable possibilities for showing events occurring any day:
- day number color - for example "14" will be red for Valentine's Day
- Icon1 - will show any mdi icon under date, like birthday (default: gift icon)
- Icon2 - like above, just any other type of event (default: home icon)
- Icon3 - like above (default: star icon)

If you want to use any calendar's events, you have to add one or more of types:

```yaml
CalEventIcon1Filter: bills,waste       # only events with those words will be shown
CalEventIcon2Filter: cleaning          # only events with those words will be shown
entities:
- entity: calendar.YOUR_CALENDAR_HERE          # no type, it won't be shown in calendar mode
- type: holiday                        # events from this calendar will be red
  entity: calendar.YOUR_CALENDAR1_HERE
- type: icon1,icon2                    # will show icon1 and icon2, but with filters configured above
  entity: calendar.home_events
- type: icon3                          # icon1 has no filters, show all events from this calendar
  entity: calendar.birthday
```
```yaml
entities:
- entity: calendar.YOUR_CALENDAR_HERE
  type: holiday			                  # events from this calendar will be red
- entity: calendar.YOUR_CALENDAR1_HERE
  type: icon2,icon3                   # will show icon2 and icon3, but with filters configured below
- entity: calendar.birthday
  type: icon1		 	                    # Icon1 has no filters, show all events from this calendar
- entity: calendar.YOUR_CALENDAR2_HERE         # no type, it won't be shown in calendar mode
CalEventIcon1Filter: bills,waste      # only events with those words will be shown
CalEventIcon2Filter: cleaning         # only events with those words will be shown
```

If you set filters (keywords) for any type, it will show an icon only when event summary contains one of keywords. If you don't set any filter, it will show icons for all days with any events.


[commits-shield]: https://img.shields.io/github/commit-activity/y/marksie1988/atomic-calendar-revive?color=32cd32&style=for-the-badge
[commits]: https://github.com/marksie1988/atomic-calendar-revive/commits/master
[discord]: https://discord.gg/8JYbyCQ
[discord-shield]: https://img.shields.io/discord/250606775361994754?color=32cd32&style=for-the-badge
[license-shield]: https://img.shields.io/github/license/marksie1988/atomic-calendar-revive?color=32cd32&style=for-the-badge
[maintenance-shield]: https://img.shields.io/maintenance/yes/2020?color=32cd32&style=for-the-badge
[releases-shield]: https://img.shields.io/github/v/release/marksie1988/atomic-calendar-revive?color=32cd32&style=for-the-badge
[releases]: https://github.com/marksie1988/atomic-calendar-revive/releases
[issues-shield]: https://img.shields.io/github/issues/marksie1988/atomic-calendar-revive?color=32cd32&style=for-the-badge
[issues]: https://github.com/marksie1988/atomic-calendar-revive/issues
