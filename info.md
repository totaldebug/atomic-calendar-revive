<h1 align="center">
  <br>
  <img src="https://raw.githubusercontent.com/totaldebug/atomic-calendar-revive/master/.github/img/atomic_calendar_revive.png" alt="Atomic Calendar Revive">
</h1>
<p align="center">
    <a href="https://github.com/totaldebug/atomic-calendar-revive/releases">
    <img src="https://img.shields.io/github/v/release/totaldebug/atomic-calendar-revive?color=ff7034&label=Release&sort=semver&style=flat-square"
         alt="Latest Release"></a>
     <a href="https://github.com/totaldebug/atomic-calendar-revive/commits/master">
    <img src="https://img.shields.io/github/stars/totaldebug/atomic-calendar-revive.svg?style=flat-square"
         alt="GitHub last commit"></a>
    <a href="https://github.com/custom-components/hacs">
    <img src="https://img.shields.io/badge/HACS-Default-orange.svg?style=flat-square"
         alt="HACS"></a><br />
    <a href="https://github.com/totaldebug/atomic-calendar-revive/commits/master">
    <img src="https://img.shields.io/github/last-commit/totaldebug/atomic-calendar-revive.svg?style=flat-square&logo=github&logoColor=white"
         alt="GitHub last commit"></a>
    <a href="https://github.com/totaldebug/atomic-calendar-revive/issues">
    <img src="https://img.shields.io/github/issues-raw/totaldebug/atomic-calendar-revive.svg?style=flat-square&logo=github&logoColor=white"
         alt="GitHub issues"></a>
    <a href="https://github.com/totaldebug/atomic-calendar-revive/pulls">
    <img src="https://img.shields.io/github/issues-pr-raw/totaldebug/atomic-calendar-revive.svg?style=flat-square&logo=github&logoColor=white"
         alt="GitHub pull requests"></a><br />
    <a href="https://github.com/sponsors/marksie1988">
    <img src="https://img.shields.io/static/v1.svg?label=Sponsor%20My%20Work&message=💝&color=black&logo=Sponsor%20My%20Work&logoColor=white&labelColor=ff7034&style=flat-square"
         alt="Sponsor My Work"></a>
    <a href="https://www.buymeacoffee.com/marksie1988">
    <img src="https://img.shields.io/static/v1.svg?label=Buy%20me%20a%20pizza&message=🍕&color=black&logo=Buy%20me%20a%20pizza&logoColor=white&labelColor=6f4e37&style=flat-square"
         alt="Buy me a Pizza"></a>
</p>

{% if prerelease %}

### NB!: This is a Beta version!

Not all features may function as expected when using pre-release versions.

If using a pre-release, we do request that any bugs or unexpected behaviour is reported on Github

{% endif %}

{% if selected_tag.replace("v", "").replace(".","") | int = 700  %}

# v7.0.0

This release sees some major changes in the way the card functions, when upgrading
please check your configuration **before** submitting an issue as many have changed.

Documentation has been updated to reflect any changes made.

# Changed configuration options

- `blacklist` renamed to `blocklist`
- `whitelist` renamed to `allowlist`
- `locationWhitelist` changed to `allowlistLocation`
- added `blocklistLocation`
- Blocklist and allowlist now changed to use Regex for more flexibility
- `showDeclined` changed to `hideDeclined`
- `eventCalName` changed to `name` under each entity
- added `showCalendarName`
- added `showMultiDayEventParts`
- added `showWeekNumber`

{% endif %}

# Atomic Calendar Revive

A _Calendar Card_ for Home Assistant that adds **advanced settings** to allow much
more flexibility than other available calendar cards.

Allowing for the use of both Google Calendars and CalDav, With two main viewing modes:

- Event List Mode
- Calendar View Mode

## Install & Configuration

Add either a Google calendar or CalDav calendar to home assistant.

Setup & Configuration is all provided within the [documentation](https://docs.totaldebug.uk/atomic-calendar-revive)

## Compatibility

| Card Version    |     HA Version      |                                        Notes                                         |
| --------------- | :-----------------: | :----------------------------------------------------------------------------------: |
| v7.0.0          |   2022.6 Upwards    |                     Should work on older versions but not tested                     |
| v6.0.0          |   2021.11 Upwards   |                   Progress bar will not work on older HA Versions                    |
| v5.0.0 - v5.2.2 | 2021.6 to 2021.10.x | May work on older HA Versions but `hoursFormat` option will need to be manually set. |
| v4.1.1          |    0.117 Upwards    |                                                                                      |

Home Assistant 2022.5 will not work with the card you must upgrade to 2022.6

## Support

Reach out to me at one of the following places:

- [Discord](https://discord.gg/6fmekudc8Q)
- [Discussions](https://github.com/totaldebug/atomic-calendar-revive/discussions)
- [Issues](https://github.com/totaldebug/atomic-calendar-revive/issues)

## License

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-orange.svg?style=flat-square)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

- Copyright © [Total Debug](https://totaldebug.uk 'Total Debug').
