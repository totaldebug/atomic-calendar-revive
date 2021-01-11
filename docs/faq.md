---
layout: default
title: FAQ
nav_order: 5
---

# FAQs

## How come Calendar View doesnt show all my items?

By default only 5 events will be pulled from Google Calendar, to change this you need to follow the instructions [here](/atomic-calendar-revive/quickstart#show-more-than-5-events)

## No card type configured error

This usually happens when the card isn't loaded correctly by Lovelace, check that you can see the name and version in your browser console.

Ensure that you also can access the file at the location specified in HA from a browser.

## My color scheme is not showing as expected, what should I do?

If your color scheme is not showing as expected and you are using a custom theme, first please swap back to the default theme and see if this resolves the issue.

Also consider using [card-mod](https://github.com/thomasloven/lovelace-card-mod) instead, this is a much better way to control the cards looks.
