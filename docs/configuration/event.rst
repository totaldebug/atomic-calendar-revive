##################
Event Mode Options
##################

======================= ========== ======== ===========================================================================================================
 Name                    Type       Since    Description
======================= ========== ======== ===========================================================================================================
 showCurrentEventLine    boolean    v0.3.0   ``false`` Show line before next event. Don't enable when showProgressBar is true - will look bad
 showProgressBar         boolean    v0.5.5   ``true`` Show event progress with moving icon. Don't enable when showCurrentEventLine - will look bad
 showFullDayProgress     boolean    v1.7.0   ``false`` Enables the progress bar for full day events
 showRelativeTime        boolean    v2.1.0   ``true`` Show relative time until the start of an event
 showEventIcon           boolean    v2.2.3   ``false`` Show the entity icon before the event title
 europeanDate            boolean    v2.2.3   ``false`` Show date for event days in european format
 softLimit               integer    v2.7.0   Adds flexibility when ``maxEventCount`` is set, so if there is only e.g. 1 extra event it would be shown
 showHiddenText          boolean    v3.3.0   ``true`` Show x hidden events when limited number of events selected
 hiddenEventText         string     v3.3.0   ``localize('common.hiddenEventText')`` allows a user to change the text displayed for hidden events
 showCalendarName        boolean    v7.0.0   ``false`` Show the calendar name in Event Mode
 showWeekNumber          boolean    v7.0.0   ``false`` Show the year week number at the beginning of each week
 showEventDate           boolean    v7.1.0   ``true`` Show the event date
 showDatePerEvent        boolean    v7.2.0   ``false`` Show the date next to each event entry
 showTimeRemaining       boolean    v7.3.0   ``false`` Show the amount of time remaining for an event
 hoursOnSameLine         boolean    v7.3.0   ``false`` if set true will move hours to show on the same line as the summary.
 showAllDayHours         boolean    v7.5.0   ``true`` Show "All Day" text under full day events
======================= ========== ======== ===========================================================================================================
