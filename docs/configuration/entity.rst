##############
Entity Options
##############

==================== ========= ======== =============================================================================================================
 Name                 Type      Since    Description
==================== ========= ======== =============================================================================================================
 icon                 string    v2.0.0   ``null`` Add an icon to a calendar. If not set, will use the entity icon set in HA. see note below
 startTimeFilter      string    v2.0.0   Only shows events between specific times _NOTE_ must be set with ``endTimeFilter`` format: ``'10:00'``
 endTimeFilter        string    v2.0.0   Only shows events between specific times _NOTE_ must be set with ``startTimeFilter`` format: ``'17:00'``
 maxDaysToShow        integer   v5.2.0   ``7`` Maximum number of days to show. Overrides main configuration maxDaysToShow for this calendar
 blocklist            string    v7.0.0   ``null`` Simple case insensitive regex to ignore events that match title
 blocklistLocation    string    v7.0.0   ``null`` Simple case insensitive regex to ignore events that match location
 allowlist            string    v7.0.0   ``null`` Simple case insensitive regex to ignore events that match title
 allowlistLocation    string    v7.0.0   ``null`` Simple case insensitive regex to only add events that match location
 showMultiDay         boolean   v7.0.0   ``false`` Split multi-day events across all days
 name                 string    v7.0.0   ``null`` Add a calendar name to be shown with event
 eventTitle           string    v7.3.0   Where no event title exists, add this string instead, Will only add to this entity, can also be globally set
 color                string             ``null`` Default color for this calendar's event titles
==================== ========= ======== =============================================================================================================

.. note::
   It is not advised to use ``allowlist`` & ``blocklist`` under the same entity.

.. note::
   Set the calendar entity icon by going to ``Settings -> Entities`` search for ``calendar``
   Click the calendar you wish to change, click the cog in the top right and set a new icon.

   This is how I recommend setting up the icons now.
