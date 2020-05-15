---
layout: default
title: Calendar Mode Options
parent: Configuration Options
nav_order: 4
---

| Name | Type | Since | Description |
|------|:----:|:-----:|-------------|
| enableModeChange | boolean | v0.7.0 | `false` Set true to enable mode change (Calendar/Events) must have "name" set to toggle
| defaultMode | integer | v0.7.0 | `1` Set `1` to make Events default mode, set `2` to make Calendar mode default
| firstDayOfWeek | integer | v0.7.0 | `1` First day of week, default 1 for Monday
| CalEventHolidayColor | string | v0.7.0 | `red` Color of day for `type: holiday` calendar
| CalEventIcon1 | string | v0.7.0 | `mdi:gift` Icon for `type: icon1` calendar
| CalEventIcon1Color | string | v0.7.0 | `default` Color of icon for `type: icon1` calendar
| CalEventIcon1Filter | string | v0.7.0 | `null` List of comma separated keywords
| CalEventIcon2 | string | v0.7.0 | `mdi:home` Icon for `type: icon2` calendar
| CalEventIcon2Color | string | v0.7.0 | `default` Color of icon for `type: icon2` calendar
| CalEventIcon2Filter | string | v0.7.0 | `null` List of comma separated keywords
| CalEventIcon3 | string | v0.7.0 | `mdi:star` Icon for `type: icon3` calendar
| CalEventIcon3Color | string | v0.7.0 | `default` Color of icon for `type: icon3` calendar
| CalEventIcon3Filter | string | v0.7.0 | `null` List of comma separated keywords
| showLastCalendarWeek  | boolean | v0.7.5 | `false` If true it will always show 6 lines. If false, the 6th line won't be displayed if not needed.
| calEventTime | bool | v1.5.0 | `false` If true the time will be shown on the event summary for the selected day
| disableCalEventLink | bool | v1.5.0 | `false` If true the link will be disabled on the event summary for the selected day
| disableCalLocationLink | bool | v1.5.0 | `false` If true the link will be disabled on the event location icon for the selected day
