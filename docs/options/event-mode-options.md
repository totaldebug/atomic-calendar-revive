---
layout: default
title: Event Mode Options
parent: Configuration Options
nav_order: 3
---

## Config Options

| Name                 |  Type   | Since  | Description                                                                                            |
| -------------------- | :-----: | :----: | ------------------------------------------------------------------------------------------------------ |
| showCurrentEventLine | boolean | v0.3.0 | `false` Show line before next event. Don't enable when showProgressBar is true - will look bad         |
| showProgressBar      | boolean | v0.5.5 | `true` Show event progress with moving icon. Don't enable when showCurrentEventLine - will look bad    |
| showFullDayProgress  | boolean | v1.7.0 | `false` Enables the progress bar for full day events                                                   |
| showRelativeTime     | boolean | v2.1.0 | `true` show relative time to event                                                                     |
| showEventIcon        | boolean | v2.2.3 | `false` Show the entity icon before the event title                                                    |
| europeanDate         | boolean | v2.2.3 | `false` Show date for event days in european format                                                    |
| softLimit            | integer | v2.7.0 | Adds flexibility when `maxEventCount` is set, so if there is only e.g. 1 extra event it would be shown |

## Color Options

If you don't set colors, default theme colors will be used. If you use automatic night/day modes, don't use manual color settings.

| Name                |  Type   | Since  | Description                                                       |
| ------------------- | :-----: | :----: | ----------------------------------------------------------------- |
| eventBarColor       | string  | v0.3.0 | `default color` Color of line showing next event                  |
| dateColor           | string  | v0.3.0 | `primary text color` Color of date (left side)                    |
| dateSize            | integer | v0.3.0 | `90` Date text size (percent of default font)                     |
| timeColor           | string  | v0.3.0 | `primary color` Color of time (under the event title)             |
| timeSize            | integer | v0.3.0 | `90` Time text size (percent of default font)                     |
| eventTitleColor     | string  | v0.3.0 | `primary text color` Color of event title                         |
| eventTitleSize      | integer | v0.3.0 | `100` Event title text size (percent of default font)             |
| dayWrapperLineColor | string  | v0.3.0 | `primary text color` Color of line - days separate                |
| progressBarColor    | string  | v0.5.5 | `default color` Color of progress bar                             |
| descColor           | string  | v0.8.4 | `primary text color` Description of date (left side)              |
| descSize            | integer | v0.8.4 | `80` Description text size (percent of default font)              |
| eventCalNameColor   | string  | v1.2.0 | `primary text color` color of `eventCalName` if set               |
| eventCalNameSize    | integer | v1.2.0 | `90` text size of `eventCalName` if set (percent of default font) |
