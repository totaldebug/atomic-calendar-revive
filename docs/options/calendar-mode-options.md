---
layout: default
title: Calendar Mode Options
parent: Configuration Options
nav_order: 4
---

## Config Options

| Name                   |  Type   | Since  | Description                                                                                           |
| ---------------------- | :-----: | :----: | ----------------------------------------------------------------------------------------------------- |
| enableModeChange       | boolean | v0.7.0 | `false` Set true to enable mode change (Calendar/Events) must have "name" set to toggle               |
| firstDayOfWeek         | integer | v0.7.0 | `1` First day of week, default 1 for Monday                                                           |
| showLastCalendarWeek   | boolean | v0.7.5 | `false` If true it will always show 6 lines. If false, the 6th line won't be displayed if not needed. |
| calEventTime           | boolean | v1.5.0 | `false` If true the time will be shown on the event summary for the selected day                      |
| disableCalEventLink    | boolean | v1.5.0 | `false` If true the link will be disabled on the event summary for the selected day                   |
| disableCalLocationLink | boolean | v1.5.0 | `false` If true the link will be disabled on the event location icon for the selected day             |

## Color Options

If you don't set colors, default theme colors will be used. If you use automatic night/day modes, don't use manual color settings.

| Name                          |  Type  | Since  | Description                                                                      |
| ----------------------------- | :----: | :----: | -------------------------------------------------------------------------------- |
| calGridColor                  | string | v1.3.0 | `rgba(86, 86, 86, .35)` color of calendar grid border                            |
| calEventBackgroundColor       | string | v1.3.0 | `rgba(86, 100, 86, .35)` background color of todays calendar date                |
| calEventSatColor              | string | v1.3.0 | `rgba(86, 86, 86, .05)` Sets Saturday to a different color                       |
| calEventSunColor              | string | v1.3.0 | `rgba(255, 255, 255, .15)` Sets Sunday to a different color                      |
| calActiveEventBackgroundColor | string | v1.4.0 | `rgba(86, 128, 86, .35)` Sets selected day to different color                    |
| defaultCalColor               | string | v1.5.0 | `primary text color` Sets the default calendar color if not set under the entity |
| calDayColor                   | string | v1.6.0 | `primary text color` Sets the calendar day number color                          |
| calWeekDayColor               | string | v1.6.0 | `primary text color` Sets the weekday title color in calendar mode               |
| calDateColor                  | string | v1.6.0 | `primary text color` Sets the date selector color in calendar mode               |
