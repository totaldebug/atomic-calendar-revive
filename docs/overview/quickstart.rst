.. _quickstart:

**************
🚀 Quick Start
**************

This quick start guide will take you through the easiest ways to get up and running.
Please note that this quick start guide assumes you already have a calendar setup in
Home Assistant, this card fully supports `Google Calendar <https://www.home-assistant.io/integrations/calendar.google/>`_
and has support for `calDav <https://www.home-assistant.io/integrations/caldav/>`_
although calDav calendars may see limited functionality with some features.


Installation
############

.. note::
   You must have either the `Google calendar <https://www.home-assistant.io/components/calendar.google/>`_
   or `calDav <https://www.home-assistant.io/integrations/caldav/>`_ component configured in Home Assistant
   prior to commencing.

HACS (Recommended)
******************

Install using `HACS` component:

#. You need HACS installed and configured
#. Go to plugins tab
#. Search for ``Atomic Calendar Revive``
#. Install the card

Manual
******

#. Download ``atomic-calendar-revive.js`` file from the ``dist`` directory to ``/www/community/atomic-calendar-revive/atomic-calendar-revive.js`` directory in your Home Assistant - `latest release <https://github.com/totaldebug/atomic-calendar-revive/releases/latest>`_
#. If you use the Lovelace Editor then add the follwoing to ``Configuration -> Lovelace Dashboards -> Resources``

.. code-block:: yaml
   :linenos:

    /local/community/atomic-calendar-revive/atomic-calendar-revive.js

#. If you edit your files directly, add the below to the `ui-lovelace.yaml` file :

.. code-block:: yaml
   :linenos:

    resources:
      - url: /local/community/atomic-calendar-revive/atomic-calendar-revive.js
        type: module

.. note::

   If you are upgrading, try to reload your browser cache by pressing ctrl-shift-r or shift-F5.

.. note::

   If you want to use ``Calendar mode`` follow the guide :ref:`more-than-5`, by default HA only gets 5 events from Google Calendar.


.. _more-than-5:

Show more than 5 events
#######################

In order to increase the amount of events that are shown you have to add `max_results` setting to `google_calendars.yaml` file

For calendar mode we recommend that this is set to at least 42

.. code-block:: yaml
   :linenos:

    - cal_id: xxxxxxxxxxxxxxxxxxxx@group.calendar.google.com
      entities:
      - device_id: calendar_id
        name: Calendar_name
        max_results: 42


Configuration
#############

For more configuration options check out :ref:`this section <mainoptions>`.


Simple Configuration
********************

The easiest way to configure the card is via the built in editor.

#. Edit the page you want to add the card to
#. Click ``Add Card`` at the bottom right
#. Scroll down to ``Custom:Atomic Calendar Revive`` and click it
#. Click the ``Required`` section and toggle the calendars you wish to add
#. Setup all other options as you would like going through each section in the editor

Advanced Configuration
**********************

In order to setup the calendar with more advanced configuration you can edit directly
from the code editor in YAML. Here you will be able to add any options as per this documetation

Example:

.. code-block:: yaml
   :linenos:

    - type: "custom:atomic-calendar-revive"
      entities:
      - entity: calendar.YOUR_CALENDAR_HERE
        name: 'My Calendar'
        color: red
        allowlist: '(word1)|(word2)'
      - entity: calendar.YOUR_CALENDAR1_HERE
        blocklist: '(word1)|(word2)'
