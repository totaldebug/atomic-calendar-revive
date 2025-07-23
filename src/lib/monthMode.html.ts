import { html } from 'lit';
import EventClass from './event.class';
import { atomicCardConfig } from '../types/config';
import dayjs from 'dayjs';

function renderEvent(event: EventClass, config: atomicCardConfig) {
  const eventColor = event.entityConfig.color || config.defaultCalColor;
  return html`
    <div class="month-event" style="background-color: ${eventColor}">
      <div class="month-event-title">${event.title}</div>
    </div>
  `;
}

export function getMonthDaysHTML(month, config) {
  return month.map((day) => {
    const dayDate = day.date;
    const dayClassToday = dayDate.isSame(dayjs(), 'day') ? 'currentDay' : '';
    console.log("month mode")
    return html`
      <div class="month-day ${dayClassToday}">
        <div class="month-day-number">${dayDate.date()}</div>
        <div class="month-day-events">
          ${day.allEvents.map((event) => renderEvent(event, config))}
        </div>
      </div>
    `;
  });
}
