# atomic_calendar
Advanced (experimental) calendar card for Home Assistant with Lovelace

It is my custom calendar card with advanced settings. It loads calendar events from Home Assistant calendar component.

The most important features:
- Show time of events in a different way (dates, hours)
- Custom colors and settings for different calendars, custom font sizes, colors of every text and line
- Move today's completed events up and dim them
- Show progress bar before the next event
- Use moment.js library, but load it internally, from local /www folder or from any address

The component should not work slower than other calendars, the bottleneck is the download of data from Google calendar.
