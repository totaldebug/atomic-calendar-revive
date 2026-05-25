##############
Entity Options
##############

==================== ============== =============================================================================================================
 Name                 Type           Description
==================== ============== =============================================================================================================
 icon                 string         ``null`` Add an icon to a calendar. If not set, will use the entity icon set in HA. see note below
 startTimeFilter      string         Only shows events between specific times _NOTE_ must be set with ``endTimeFilter`` format: ``'10:00'``
 endTimeFilter        string         Only shows events between specific times _NOTE_ must be set with ``startTimeFilter`` format: ``'17:00'``
 maxDaysToShow        integer        ``7`` Maximum number of days to show. Overrides main configuration maxDaysToShow for this calendar
 blocklist            string         ``null`` Case-insensitive regex to ignore events whose title matches. Matched against the original summary, even when ``titleReplace`` rewrites the display title
 blocklistLocation    string         ``null`` Simple case insensitive regex to ignore events that match location
 allowlist            string         ``null`` Case-insensitive regex to only show events whose title matches. Matched against the original summary
 allowlistLocation    string         ``null`` Simple case insensitive regex to only add events that match location
 showMultiDay         boolean        ``false`` Split multi-day events across all days
 name                 string         ``null`` Add a calendar name to be shown with event
 eventTitle           string         Where no event title exists, add this string instead, Will only add to this entity, can also be globally set
 color                string         ``null`` Default color for this calendar's event titles
 showDescription      boolean        Per-entity override of the global ``showDescription``. Useful to show descriptions for some calendars (e.g. kids) and hide them for others
 showHours            boolean        Per-entity override of the global ``showHours``. Useful for public iCal feeds (e.g. holidays) where times are not meaningful
 fontSize             string|number  Font size of this calendar's event titles. Numbers are treated as ``px``; strings pass through (``'120%'``, ``'1.1em'``)
 fontWeight           string|number  Font weight of this calendar's event titles. Accepts CSS keywords (``'bold'``) or numeric weights (``700``)
 titleReplace         list           Ordered list of ``{from, to}`` rewrites applied to the display title. ``from`` is a case-insensitive regex; ``to`` is the replacement (empty strips the match). See example below
==================== ============== =============================================================================================================

.. note::
   It is not advised to use ``allowlist`` & ``blocklist`` under the same entity.

Example — rewrite shared-calendar titles
========================================

Strip a ``Dinner = `` prefix so a filtered "Dinners" card shows only the meal:

.. code-block:: yaml

    type: custom:atomic-calendar-revive
    entities:
      - entity: calendar.family
        allowlist: '^Dinner = '
        titleReplace:
          - from: '^Dinner = '
            to: ''

Rename per-person tags ("Daddy Work" → "Work", strip "hat Geburtstag"):

.. code-block:: yaml

    entities:
      - entity: calendar.daddy
        name: Daddy
        titleReplace:
          - from: '^Daddy '
            to: ''
          - from: ' hat Geburtstag$'
            to: ''

.. note::
   Set the calendar entity icon by going to ``Settings -> Entities`` search for ``calendar``
   Click the calendar you wish to change, click the cog in the top right and set a new icon.

   This is how I recommend setting up the icons now.
