#######
Styling
#######

From version 9 onward, the card delegates fine-grained styling to
`card-mod <https://github.com/thomasloven/lovelace-card-mod>`_ rather than
exposing one config key per color. Two patterns work out of the box.

Whole-card styling with ``card_mod``
====================================

For the common case — changing the background and text color of the entire
card — a single ``ha-card`` rule is enough. The calendar grid, event
summaries, planner rows, weekday headers, month label, and modal will all
inherit the new text color.

.. code-block:: yaml

    type: custom:atomic-calendar-revive
    entities:
      - calendar.family
    defaultMode: Calendar
    card_mod:
      style: |
        ha-card {
          background-color: #1e293b;
          color: #f1f5f9;
          border-radius: 12px;
          padding: 12px;
        }

This pattern works the same in Event, Calendar, Planner and Inline modes.

Granular styling with custom properties
=======================================

When different parts of the card need different colors, set the matching custom
properties on ``ha-card`` instead. Inner elements pick these up through the
shadow DOM cascade.

Text & calendar grid
--------------------

.. list-table::
    :widths: 32 68
    :header-rows: 1

    * - Custom property
      - Affects
    * - ``--cal-name-color``
      - Card name / title in the header
    * - ``--cal-weekday-color``
      - Weekday column headers in Calendar mode (Mo, Tu, We…)
    * - ``--cal-day-color``
      - Day numbers inside the grid cells
    * - ``--cal-date-color``
      - Month/year label and the prev/next arrows
    * - ``--cal-event-title-color``
      - Event titles in the Calendar-mode day summary
    * - ``--cal-description-color``
      - Event description text
    * - ``--cal-description-size``
      - Event description font size (e.g. ``80%``)
    * - ``--cal-grid-color``
      - Calendar grid borders
    * - ``--cal-active-event-bg``
      - Background of the day cell you click into
    * - ``--cal-weekend-sat-bg``
      - Saturday column background overlay
    * - ``--cal-weekend-sun-bg``
      - Sunday column background overlay

Event row
---------

.. list-table::
    :widths: 32 68
    :header-rows: 1

    * - Custom property
      - Affects
    * - ``--cal-event-bar-color``
      - "Next event" separator bar (when ``showCurrentEventLine`` is on)
    * - ``--cal-progress-bar``
      - Foreground of the running-event progress bar
    * - ``--cal-progress-bar-bg``
      - Background track of the running-event progress bar
    * - ``--cal-progress-shadow``
      - Box-shadow of the progress element (e.g. ``none`` to remove)
    * - ``--cal-location-icon-color``
      - Color of the map-pin icon next to event locations
    * - ``--cal-location-link-size``
      - Font size of the event location link (e.g. ``90%``)

Loader, modal & layout
----------------------

.. list-table::
    :widths: 32 68
    :header-rows: 1

    * - Custom property
      - Affects
    * - ``--cal-loader-track-color``
      - Spinner track color (visible while events are loading)
    * - ``--cal-loader-color``
      - Spinner active arc color
    * - ``--cal-modal-overlay-bg``
      - Backdrop behind the event-detail modal
    * - ``--cal-modal-bg``
      - Modal body background
    * - ``--cal-modal-border-color``
      - Modal border
    * - ``--cal-modal-color``
      - Modal text color
    * - ``--cal-modal-close-color``
      - Modal close (×) button color
    * - ``--cal-modal-close-hover-color``
      - Modal close button color on hover/focus
    * - ``--cal-host-height``
      - How the card sizes against its parent. Default ``100%`` (fills the
        Lovelace grid cell). Set to ``auto`` to shrink-wrap the content.

Example
-------

.. code-block:: yaml

    type: custom:atomic-calendar-revive
    entities:
      - calendar.family
    defaultMode: Calendar
    card_mod:
      style: |
        ha-card {
          --cal-weekday-color: var(--accent-color);
          --cal-day-color: #f1f5f9;
          --cal-grid-color: rgba(255, 255, 255, 0.1);
          --cal-active-event-bg: rgba(255, 200, 0, 0.25);
          --cal-weekend-sat-bg: rgba(255, 255, 255, 0.02);
          --cal-weekend-sun-bg: rgba(255, 255, 255, 0.08);
          --cal-host-height: auto;
        }

Mixing both patterns is fine: a blanket ``color`` rule for the broad strokes
and a handful of ``--cal-*`` overrides for the elements that need to stand out.

Targeting other elements
========================

The card uses descriptive CSS classes throughout (``.calDay``,
``.day-number``, ``.currentDay``, ``.summary-event-div``,
``.bullet-event-div-accepted`` etc.) so anything not covered by the custom
properties above can be targeted with regular ``card_mod`` selectors. The video
below walks through finding the right class with browser devtools.

.. image:: https://img.youtube.com/vi/-5MKd7LY-oc/maxresdefault.jpg
    :alt: Atomic Calendar Revive and card_mod
    :target: https://www.youtube.com/watch?v=-5MKd7LY-oc

If a class you need isn't exposed, please open a feature request.
