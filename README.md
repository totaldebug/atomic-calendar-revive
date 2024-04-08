<a name="readme-top"></a>

[![Release][release-shield]][release-url]
[![Stargazers][stars-shield]][stars-url]
[![HACS][hacs-shield]][hacs-url]

![GitHub last release date][gh-last-release-date]
![GitHub last commit][gh-last-commit]

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Issues][issues-shield]][issues-url]

[![Lines of code][lines]][lines-url]
![Code size][code-size]

[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/totaldebug/atomic-calendar-revive">
    <img src="https://raw.githubusercontent.com/totaldebug/atomic-calendar-revive/master/.github/img/atomic_calendar_revive.png" alt="Logo">
  </a>

  <h3 align="center">Atomic Calendar Revive</h3>

  <p align="center">
    An advanced calendar card for Home Assistant Lovelace.
  </p>
    <br />
    <br />
    <a href="https://github.com/totaldebug/atomic-calendar-revive/issues/new?assignees=&labels=type%2Fbug&template=bug_report.yml">Report Bug</a>
    ·
    <a href="https://github.com/totaldebug/atomic-calendar-revive/discussions/categories/feature-requests">Request Feature</a>

</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#compatibility">Compatibility</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#sponsor">Sponsor</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

A *Calendar Card* for Home Assistant that adds **advanced settings** to allow much
more flexibility than other available calendar cards.

Allowing for the use of both Google Calendars and CalDav, With two main viewing modes:

* Event List Mode
* Calendar View Mode

| Event Mode | Calendar Mode |
| ------------- | ---------- |
| <img src="https://raw.githubusercontent.com/totaldebug/atomic-calendar-revive/master/.github/img/event-mode-example.png" width="300"/> | <img src="https://raw.githubusercontent.com/totaldebug/atomic-calendar-revive/master/.github/img/calendar-mode-allday.png" width="300"/> |
| <img src="https://raw.githubusercontent.com/totaldebug/atomic-calendar-revive/master/.github/img/event-mode-no-date.png" width="300"/> | <img src="https://raw.githubusercontent.com/totaldebug/atomic-calendar-revive/master/.github/img/calendar-mode-today.png" width="300"/> |

Please keep in mind, these screenshots show a basic configuration, this card allows so much more customisation!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

[![typescript][typescript]][typescript-url]

[![rollup][rollup]][rollup-url]

[![dayjs][dayjs]][dayjs-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

* [QuickStart Guide](https://docs.totaldebug.uk/atomic-calendar-revive/overview/quickstart.html)
* [Full Documentation](https://docs.totaldebug.uk/atomic-calendar-revive)
* [Release Notes](https://github.com/totaldebug/atomic-calendar-revive/releases)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features

* Event List & Calendar Views
* Lovelace UI Editor Support
* Keyword Allow and Block lists
* Hide finished events
* Event Progress bar
* Language Translations
* Limit total number of events
* Relative time until events
* Sort events by start times
* Only show events between specific times
* Event Limits & Soft Event Limits
* Disable Links
* MDI Icon support
* Split multi-day events to show on each day with part numbers
* Pre-Compiled with required libraries
* Plus many more features added regularly

## Compatibility

| Card Version | HA Version | Notes |
| --- | --- | --- |
| v7.0.0 | 2022.6 Upwards |  |
| v6.0.0 | 2021.11 Upwards | Progress bar will not work on older HA Versions |
| v5.0.0 - v5.2.2 | 2021.6 to 2021.10.x | May work on older HA Versions but `hoursFormat` option will need to be manually set. |
| v4.1.1 | 0.117 Upwards |

Home Assistant 2022.5 will not work with the card you must upgrade to 2022.6

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

See the [feature requests](https://github.com/totaldebug/atomic-calendar-revive/discussions/categories/feature-requests) for a full list of requested features.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Sponsor

My projects arent possible without the support of the community, please consider donating a small amount to keep these projects alive.

[![Sponsor][Sponsor]][Sponsor-url]

<!-- CONTRIBUTING -->
## Contributing

Got something you would like to add? check out the contributing guide in the [documentation](https://docs.totaldebug.uk/atomic-calendar-revive)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

[![MIT License][license-shield]][license-url]

* Copyright © [Total Debug](https://totaldebug.uk).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

* [Discord](https://discord.gg/6fmekudc8Q)
* [Discussions](https://github.com/totaldebug/atomic-calendar-revive/discussions)
* [Project Link](https://github.com/totaldebug/atomic-calendar-revive)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

Below are a list of resources that I used to assist with this project.

* This card wouldnt exist without the original author [atomic7777](https://github.com/atomic7777)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[release-shield]: https://img.shields.io/github/v/release/totaldebug/atomic-calendar-revive?color=ff7034&label=Release&sort=semver&style=flat-square
[release-url]: https://github.com/totaldebug/atomic-calendar-revive/releases
[contributors-shield]: https://img.shields.io/github/contributors/totaldebug/atomic-calendar-revive.svg?style=flat-square
[contributors-url]: https://github.com/totaldebug/atomic-calendar-revive/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/totaldebug/atomic-calendar-revive.svg?style=flat-square
[forks-url]: https://github.com/totaldebug/atomic-calendar-revive/network/members
[stars-shield]: https://img.shields.io/github/stars/totaldebug/atomic-calendar-revive.svg?style=flat-square
[stars-url]: https://github.com/totaldebug/atomic-calendar-revive/stargazers
[issues-shield]: https://img.shields.io/github/issues/totaldebug/atomic-calendar-revive.svg?style=flat-square
[issues-url]: https://github.com/totaldebug/atomic-calendar-revive/issues
[license-shield]: https://img.shields.io/github/license/totaldebug/atomic-calendar-revive.svg?style=flat-square
[license-url]: https://github.com/totaldebug/atomic-calendar-revive/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/marksie1988
[hacs-shield]: https://img.shields.io/badge/HACS-Default-orange.svg?style=flat-square
[hacs-url]: https://github.com/hacs/integration

[gh-last-release-date]: https://img.shields.io/github/release-date/totaldebug/atomic-calendar-revive?style=flat-square&label=Last%20Release%20Date&logo=github&logoColor=white
[gh-last-commit]: https://img.shields.io/github/last-commit/totaldebug/atomic-calendar-revive.svg?style=flat-square&logo=github&label=Last%20Commit&logoColor=white

[lines]: https://img.shields.io/tokei/lines/github/totaldebug/atomic-calendar-revive?style=flat-square
[lines-url]: https://github.com/totaldebug/atomic-calendar-revive
[code-size]: https://img.shields.io/github/languages/code-size/totaldebug/atomic-calendar-revive?style=flat-square

[Sponsor]: https://img.shields.io/badge/sponsor-000?style=flat-square&logo=githubsponsors&logoColor=red
[Sponsor-url]: https://github.com/sponsors/marksie1988

[typescript]: https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=TypeScript&logoColor=white
[typescript-url]: https://www.typescriptlang.org/
[rollup]: https://img.shields.io/badge/Rollup.js-000?style=flat-square&logo=rollup.js&logoColor=red
[rollup-url]: https://rollupjs.org/guide/en/
[dayjs]: https://img.shields.io/badge/Day.js-000?style=flat-square
[dayjs-url]: https://day.js.org/
