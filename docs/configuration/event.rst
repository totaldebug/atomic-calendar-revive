##################
Event Mode Options
##################

======================= ========== ======== ===========================================================================================================
 Name                    Type       Since    Description
======================= ========== ======== ===========================================================================================================
 showCurrentEventLine    boolean    v0.3.0   ``false`` Show line before next event. Don't enable when showProgressBar is true - will look bad
 showProgressBar         boolean    v0.5.5   ``true`` Show event progress with moving icon. Don't enable when showCurrentEventLine - will look bad
 showFullDayProgress     boolean    v1.7.0   ``false`` Enables the progress bar for full day events
 showRelativeTime        boolean    v2.1.0   ``true`` show relative time to event
 showEventIcon           boolean    v2.2.3   ``false`` Show the entity icon before the event title
 europeanDate            boolean    v2.2.3   ``false`` Show date for event days in european format
 softLimit               integer    v2.7.0   Adds flexibility when ``maxEventCount`` is set, so if there is only e.g. 1 extra event it would be shown
 showHiddenText          boolean    v3.3.0   ``true`` Show x hidden events when limited number of events selected
 hiddenEventText         string     v3.3.0   ``localize('common.hiddenEventText')`` allows a user to change the text displayed for hidden events
 showCalendarName        boolean    v7.0.0   ``false`` Show the calendar name in Event Mode
 showWeekNumber          boolean    v7.0.0   ``false`` Show the year week number at the beginning of each week
======================= ========== ======== ===========================================================================================================
