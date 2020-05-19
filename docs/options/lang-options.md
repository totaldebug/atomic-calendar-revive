---
layout: default
title: Language Options
parent: Configuration Options
nav_order: 5
---

Week / month names are translated automatically

| Name                    |  Type  | Since  | Description                                                                                                                               |
| ----------------------- | :----: | :----: | ----------------------------------------------------------------------------------------------------------------------------------------- |
| language                | string | v0.8.4 | `default` Force language change. For example `pt-br`. If not set, default HA language is used.                                            |
| untilText               | string | v0.3.0 | `Until` Custom translation of `Until` text                                                                                                |
| fullDayEventText        | string | v0.3.0 | `All day` Custom translation of `All day` text                                                                                            |
| noEventsForNextDaysText | string | v0.8.6 | `No events in the next days` Custom translation of `No events in the next days` text                                                      |
| noEventsForTodayText    | string | v0.8.6 | `No events for today` Custom translation of `No events for today` text, only if `showNoEventsForToday` is true                            |
| dateFormat              | string | v0.7.2 | `LL` Custom date format - see https://devhints.io/moment                                                                                  |
| hoursFormat             | string | v0.7.3 | `default` Custom hours format - you can set `12h` or `24h` or `default` (HA settings) or custom, `HH:mm` - see https://devhints.io/moment |
