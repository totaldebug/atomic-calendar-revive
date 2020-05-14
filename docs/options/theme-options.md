---
layout: default
title: Theme Options
parent: Configuration Options
nav_order: 6
---

If you don't set colors, default theme colors will be used. If you use automatic night/day modes, don't use manual color settings.

| Name | Type | Since | Description |
|------|:----:|:-----:|-------------|
| dateColor | string | v0.3.0 | `default text color` Color of date (left side)
| dateSize | integer | v0.3.0 | `90` Date text size (percent of default font)
| timeColor | string | v0.3.0 | `default color` Color of time (under the event title)
| timeSize | integer | v0.3.0 | `90` Time text size (percent of default font)
| titleColor | string | v0.3.0 | `default text color` Color of event title
| titleSize | integer | v0.3.0 | `100` Event title text size (percent of default font)
| locationLinkColor | string | v0.3.0 | `default text color` Color of location link (right side)
| locationTextSize | integer | v0.3.0 | `90` Location text size (percent of default font)
| locationIconColor | string | v0.3.0 | `rgb(230, 124, 115)` Color of location icon
| hideFinishedEvents | boolean | v0.9.0 | `false` Don't display finished events
| dimFinishedEvents | boolean | v0.3.0 | `true` Apply filters to finished events (configured below)
| finishedEventOpacity | float | v0.3.0 | `0.6` Opacity level of finished events
| finishedEventOpacity | string | v0.3.0 | `grayscale(100%)` additional css filter to of finished events (default - greyscale)
| dayWrapperLineColor | string | v0.3.0 | `default text color` Color of line - days separate
| descColor | string | v0.8.4 | `default text color` Description of date (left side)
| descSize | integer | v0.8.4 | `80` Description text size (percent of default font)
| eventCalNameColor | string | v1.2.0 | `default text color` color of `eventCalName` if set
| eventCalNameSize | integer | v1.2.0 | `90` text size of `eventCalName` if set (percent of default font)
| CalGridColor | string | v1.3.0 | `rgba(86, 86, 86, .35)` color of calendar grid border
| CalEventBackgroundColor | string | v1.3.0 | `rgba(86, 100, 86, .35)` background color of todays calendar date
| calEventBulletColor | string | v1.3.0 | `#cc5500` Sets bullet color for events on calendar day
| CalEventSatColor | string | v1.3.0 | `rgba(86, 86, 86, .05)` Sets Saturday to a different color
| CalEventSunColor | string | v1.3.0 | `rgba(255, 255, 255, .15)` Sets Sunday to a different color
| calActiveEventBackgroundColor | string | v1.4.0 | `rgba(86, 128, 86, .35)` Sets selected day to different color
