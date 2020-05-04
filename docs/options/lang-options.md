---
layout: default
title: Language Options
parent: Configuration Options
nav_order: 1
---

Week / month names are translated automatically

| Name | Type | Default | Since | Description |
|------|:----:|:-------:|:-----:|-------------|
| language | string | optional | v0.8.4 | `default` Force language change. For example `pt-br`. If not set, default HA language is used.
| untilText | string | optional | v0.3.0 | `Until` Custom translation of `Until` text
| fullDayEventText | string | optional | v0.3.0 | `All day` Custom translation of `All day` text
| noEventsForNextDaysText | string | optional | v0.8.6 | `No events in the next days` Custom translation of `No events in the next days` text
| noEventsForTodayText | string | optional | v0.8.6 | `No events for today` Custom translation of `No events for today` text, only if `showNoEventsForToday` is true
| dateFormat | string | optional | v0.7.2 | `LL` Custom date format - see https://devhints.io/moment for examples
| hoursFormat | string | optional | v0.7.3 | `default` Custom hours format - you can set `12h` or `24h` or `default` (default for local HA language settings) or even provide your custom, like `HH:mm` or `h:mm A` - see https://devhints.io/moment for examples
