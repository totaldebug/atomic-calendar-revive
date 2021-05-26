---
layout: default
title: Language Options
parent: Configuration Options
nav_order: 5
---

Week / month names are translated automatically

| Name                    |  Type  | Since  | Description                                                                                                                               |
| ----------------------- | :----: | :----: | ----------------------------------------------------------------------------------------------------------------------------------------- |
| language                | string | v0.8.4 | Force language change. If not set, default HA language is used.                             |
| untilText               | string | v0.3.0 | `Until` Custom text for `Until` text                                                        |
| fullDayEventText        | string | v0.3.0 | `All day` Custom text for `All day` text                                                    |
| noEventsForNextDaysText | string | v0.8.6 | `No events in the next days` Custom text for `No events in the next days` text              |
| noEventsForTodayText    | string | v0.8.6 | `No events for today` Custom text for `No events for today` text, only if `showNoEventsForToday` is true  |
| dateFormat              | string | v0.7.2 | `LL` Custom date format - see [list of localized formats](https://day.js.org/docs/en/display/format#localized-formats) |
| hoursFormat             | string | v0.7.3 | `24h` You can set `12h`, `24h` or custom, `HH:mm` - see [List of all available formats](https://day.js.org/docs/en/display/format#list-of-all-available-formats) |
