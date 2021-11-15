---
layout: default
title: Language Options
parent: Configuration Options
nav_order: 5
---

Week / month names are translated automatically

| Name                    |  Type  | Since  | Description                                                                                                                                                                                                 |
| ----------------------- | :----: | :----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| language                | string | v0.8.4 | Force language change. If not set, default HA language is used.                                                                                                                                             |
| untilText               | string | v0.3.0 | `Until` Custom text for `Until` text                                                                                                                                                                        |
| fullDayEventText        | string | v0.3.0 | `All day` Custom text for `All day` text                                                                                                                                                                    |
| noEventsForNextDaysText | string | v0.8.6 | `No events in the next days` Custom text for `No events in the next days` text                                                                                                                              |
| noEventText             | string | v4.1.0 | `No events` Custom text for `No events` text, only if `showNoEventsForToday` or `showNoEventDays` is true                                                                                                   |
| dateFormat              | string | v0.7.2 | `LL` Custom date format - see [list of localized formats](https://day.js.org/docs/en/display/format#localized-formats)                                                                                      |
| hoursFormat             | string | v5.0.0 | this is now set via your HA profile settings, you can still set this to override if required - see [List of all available formats](https://day.js.org/docs/en/display/format#list-of-all-available-formats) |

## Possible Locale

I have limited the number of Locales to keep the size down, however if you use
a specific locale that is not listed, please log an issue and I will look to
get this added for you.

| Locale |           Language           |
| :----: | :--------------------------: |
|   cs   |            Czech             |
|   da   |            Danish            |
| de-at  |       German (Austria)       |
| de-ch  |     German (Switzerland)     |
|   de   |            German            |
| en-au  |     English (Australian)     |
| en-ca  |       English (Canada)       |
| en-gb  |   English (United Kingdom)   |
| en-ie  |      English (Ireland)       |
| en-in  |       English (India)        |
| en-nz  |     English (New Zeland)     |
| en-sg  |     English (Singapore)      |
| en-tt  | English (Trinidad & Tobago)  |
|   en   |           English            |
| es-do  | Spanish (Dominican Republic) |
| es-pr  |    Spanish (Puerto Rico)     |
| es-us  |   Spanish (United States)    |
|   es   |           Spanish            |
|   fi   |           Finnish            |
| fr-ca  |       French (Canada)        |
| fr-ch  |     French (Switzerland)     |
|   fr   |            French            |
|   he   |            Hebrew            |
|   hu   |          Hungarian           |
| it-ch  |    Italian (Switzerland)     |
|   it   |           Italian            |
|   ja   |           Japanese           |
|   ne   |           Nepalese           |
| nl-be  |       Dutch (Belgium)        |
|   nl   |            Dutch             |
|   pl   |            Polish            |
| pt-br  |     Portuguese (Brazil)      |
|   pt   |          Portuguese          |
|   ru   |           Russian            |
|   sl   |          Slovenian           |
|   sv   |           Swedish            |
|   sk   |            Slovak            |
