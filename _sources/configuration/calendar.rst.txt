#####################
Calendar Mode Options
#####################

========================= ========== ======== ============================================================================================================
 Name                      Type       Since    Description
========================= ========== ======== ============================================================================================================
 enableModeChange          boolean    v0.7.0   ``false`` Set true to enable mode change (Calendar/Events) must have "name" set to toggle
 firstDayOfWeek            integer    v0.7.0   ``1`` First day of week, default 1 for Monday
 showLastCalendarWeek      boolean    v0.7.5   ``false`` If true it will always show 6 lines. If false, the 6th line won't be displayed if not needed.
 calEventTime              boolean    v1.5.0   ``false`` If true the time will be shown on the event summary for the selected day
 disableCalEventLink       boolean    v1.5.0   ``false`` If true the link will be disabled on the event summary for the selected day
 disableCalLocationLink    boolean    v1.5.0   ``false`` If true the link will be disabled on the event location icon for the selected day
 calShowDescription        boolean    v2.5.0   ``false`` If true this will display the description in calendar mode
 disableCalLink            boolean    v3.0.0   ``false`` If true the link to google calendar will be removed
 cardHeight                string     v4.3.0   ``100%`` Change to ``px`` or ``%`` to set the height of the card, this will add scroll if it is too small
========================= ========== ======== ============================================================================================================
