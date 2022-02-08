---
layout: default
title: Entity Options
parent: Configuration Options
nav_order: 2
---

| Name              |  Type   | Since  | Description                                                                                                     |
| ----------------- | :-----: | :----: | --------------------------------------------------------------------------------------------------------------- |
| type              | string  | v0.5.5 | `null` Type of calendar (in calendar mode) Icon1, Icon2, Icon3, Birthday. Explained below.                      |
| whitelist         | string  | v1.1.0 | `null` List of comma separated whitelisted keywords. Only events containing any of them will be shown.          |
| locationWhitelist | string  | v4.4.0 | `null` List of comma seperated whitelisted location keywords. Only events containint any of them will be shown. |
| icon              | string  | v2.0.0 | `null` Add an icon to a calendar                                                                                |
| startTimeFilter   | string  | v2.0.0 | Only shows events between specific times _NOTE_ must be set with `endTimeFilter` format: `'10:00'`              |
| endTimeFilter     | string  | v2.0.0 | Only shows events between specific times _NOTE_ must be set with `startTimeFilter` format: `'17:00'`            |
| maxDaysToShow     | integer | v5.2.0 | `7` Maximum number of days to show. Overrides main configuration maxDaysToShow for this calendar                |  |
| blacklist         | string  | v7.0.0 | `null` Simple case insensitive regex to ignore events that match title                                          |
| blocklistLocation | string  | v7.0.0 | `null` Simple case insensitive regex to ignore events that match location                                       |
| showMultiDay      | boolean | v7.0.0 | `false` Split multi-day events across all days                                                                  |
| calendarName      | string  | v7.0.0 | `null` Add a calendar name to be shown with event.                                                              |

---

**NOTE**

It is not advised to use whitelist & Balcklist under the same entity.

---

## Color Options

| Name  |  Type  | Since  | Description                                                               |
| ----- | :----: | :----: | ------------------------------------------------------------------------- |
| color | string | v1.5.0 | `defaultCalColor` Color of event title for specific calendar & Icon color |
