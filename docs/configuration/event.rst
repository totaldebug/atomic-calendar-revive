##################
Event Mode Options
##################

======================= ========== ===========================================================================================================
 Name                    Type       Description
======================= ========== ===========================================================================================================
 showCurrentEventLine    boolean    ``false`` Show line before next event. Don't enable when showProgressBar is true - will look bad
 showProgressBar         boolean    ``true`` Show event progress with moving icon. Don't enable when showCurrentEventLine - will look bad
 showFullDayProgress     boolean    ``false`` Enables the progress bar for full day events
 showRelativeTime        boolean    ``true`` Show relative time until the start of an event
 showEventIcon           boolean    ``false`` Show the entity icon before the event title
 softLimit               integer    Adds flexibility when ``maxEventCount`` is set, so if there is only e.g. 1 extra event it would be shown
 showHiddenText          boolean    ``true`` Show x hidden events when limited number of events selected
 hiddenEventText         string     ``localize('common.hiddenEventText')`` allows a user to change the text displayed for hidden events
 showCalendarName        boolean    ``false`` Show the calendar name in Event Mode
 showWeekNumber          boolean    ``false`` Show the year week number at the beginning of each week
 showEventDate           boolean    ``true`` Show the event date
 showDatePerEvent        boolean    ``false`` Show the date next to each event entry
 showTimeRemaining       boolean    ``false`` Show the amount of time remaining for an event
 hoursOnSameLine         boolean    ``false`` if set true will move hours to show on the same line as the summary.
 showAllDayHours         boolean    ``true`` Show "All Day" text under full day events
 eventDateFormat         string     ``ddd D MMM`` Set the date format for events
======================= ========== ===========================================================================================================
