---
layout: default
title: About
nav_order: 5
---

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
