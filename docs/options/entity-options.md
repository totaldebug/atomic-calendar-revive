---
layout: default
title: Entity Options
parent: Configuration Options
nav_order: 2
---

| Name            |  Type  | Since  | Description                                                                                            |
| --------------- | :----: | :----: | ------------------------------------------------------------------------------------------------------ |
| type            | string | v0.5.5 | `null` Type of calendar (in calendar mode) Icon1, Icon2, Icon3, Birthday. Explained below.             |
| blacklist       | string | v0.7.9 | `null` List of comma separated blacklisted keywords. Events containing any of them will not be shown.  |
| whitelist       | string | v1.1.0 | `null` List of comma separated whitelisted keywords. Only events containing any of them will be shown. |
| locationWhitelist | string | v4.4.0 | `null` List of comma seperated whitelisted location keywords. Only events containint any of them will be shown. |
| eventCalName    | string | v1.2.0 | `null` Add a calendar name to be shown with event.                                                     |
| icon            | string | v2.0.0 | `null` Add an icon to a calendar                                                                       |
| startTimeFilter | string | v2.0.0 | Only shows events between specific times _NOTE_ must be set with `endTimeFilter` format: `'10:00'`     |
| endTimeFilter   | string | v2.0.0 | Only shows events between specific times _NOTE_ must be set with `startTimeFilter` format: `'17:00'`   |

---

**NOTE**

It is not advised to use whitelist & Balcklist under the same entity.

---

## Color Options

| Name  |  Type  | Since  | Description                                                               |
| ----- | :----: | :----: | ------------------------------------------------------------------------- |
| color | string | v1.5.0 | `defaultCalColor` Color of event title for specific calendar & Icon color |
