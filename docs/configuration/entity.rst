##############
Entity Options
##############

==================== ========= ======== ===========================================================================================================
 Name                 Type      Since    Description
==================== ========= ======== ===========================================================================================================
 icon                 string    v2.0.0   ``null`` Add an icon to a calendar
 startTimeFilter      string    v2.0.0   Only shows events between specific times _NOTE_ must be set with ``endTimeFilter`` format: ``'10:00'``
 endTimeFilter        string    v2.0.0   Only shows events between specific times _NOTE_ must be set with ``startTimeFilter`` format: ``'17:00'``
 maxDaysToShow        integer   v5.2.0   ``7`` Maximum number of days to show. Overrides main configuration maxDaysToShow for this calendar
 blocklist            string    v7.0.0   ``null`` Simple case insensitive regex to ignore events that match title
 blocklistLocation    string    v7.0.0   ``null`` Simple case insensitive regex to ignore events that match location
 allowlist            string    v7.0.0   ``null`` Simple case insensitive regex to ignore events that match title
 allowlistLocation    string    v7.0.0   ``null`` Simple case insensitive regex to only add events that match location
 showMultiDay         boolean   v7.0.0   ``false`` Split multi-day events across all days
 name                 string    v7.0.0   ``null`` Add a calendar name to be shown with event
==================== ========= ======== ===========================================================================================================

.. note::
   It is not advised to use ``allowlist`` & ``blocklist`` under the same entity.
