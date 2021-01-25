import { css } from 'lit-element';

const style = css`
	.cal-card {
		cursor: default;
		padding: 16px;
	}

	.cal-name {
		font-size: var(--paper-font-headline_-_font-size);
		color: ${this._config.nameColor};
		padding: 4px 8px 12px 0px;
		line-height: 40px;
		cursor: default;
		float: left;
	}

	.cal-nameContainer {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		vertical-align: middle;
		align-items: center;
		margin: 0 8px 0 2px;
	}

	.calDate {
		font-size: var(--paper-font-headline_-_font-size);
		font-size: 1.3rem;
		font-weight: 400;
		color: var(--primary-text-color);
		padding: 4px 8px 12px 0px;
		line-height: 40px;
		cursor: default;
		float: right;
		opacity: 0.75;
	}

	table {
		color: black;
		margin-left: 0px;
		margin-right: 0px;
		border-spacing: 10px 5px;
		border-collapse: collapse;
	}

	td {
		padding: 4px 0 4px 0;
	}

	.daywrap {
		padding: 2px 0 4px 0;
		border-top: 1px solid;
	}

	tr {
		width: 100%;
	}

	.event-left {
		padding: 4px 10px 3px 8px;
		text-align: center;
		vertical-align: top;
	}

	.daywrap > td {
		padding-top: 8px;
	}

	.event-right {
		display: flex;
		justify-content: space-between;
		padding: 0px 5px 0 5px;
	}

	.event-description {
		display: flex;
		justify-content: space-between;
		padding: 0px 5px 0 5px;
		color: ${this._config.descColor};
		font-size: ${this._config.descSize}%;
	}

	.hoursHTML {
		color: ${this._config.timeColor};
		font-size: ${this._config.timeSize}%;
		float: left;
	}

	.relativeTime {
		color: ${this._config.timeColor};
		font-size: ${this._config.timeSize}%;
		float: right;
		padding-left: 5px;
	}

	.event-main {
		flex-direction: row nowrap;
		display: inline-block;
		vertical-align: top;
	}

	.event-location {
		text-align: right;
		display: inline-block;
		vertical-align: top;
	}

	.event-title {
		font-size: ${this._config.eventTitleSize}%;
	}

	.event-location-icon {
		--mdc-icon-size: 15px;
		color: ${this._config.locationIconColor};
		height: 15px;
		width: 15px;
		margin-top: -2px;
	}

	.location-link {
		text-decoration: none;
		color: ${this._config.locationLinkColor};
		font-size: ${this._config.locationTextSize}%;
	}

	.event-circle {
		width: 10px;
		height: 10px;
		margin-left: -2px;
	}

	hr.event {
		color: ${this._config.eventBarColor};
		margin: -8px 0px 2px 0px;
		border-width: 1px 0 0 0;
	}

	.event-cal-name {
		color: ${this._config.eventCalNameColor};
		font-size: ${this._config.eventCalNameSize}%;
	}
	.event-cal-name-icon {
		--mdc-icon-size: 15px;
	}

	.eventBar {
		margin-top: -10px;
		margin-bottom: 0px;
	}

	.progress-bar {
		--mdc-linear-progress-buffer-color: ${this._config.progressBarColor};
	}

	mwc-linear-progress {
		width: 100%;
		margin: auto;
	}

	table.cal {
		margin-left: 0px;
		margin-right: 0px;
		border-spacing: 10px 5px;
		border-collapse: collapse;
		width: 100%;
		table-layout: fixed;
	}

	td.cal {
		padding: 5px 5px 5px 5px;
		border: 1px solid ${this._config.calGridColor};
		text-align: center;
		vertical-align: middle;
		width: 100%;
	}

	.calDay {
		max-height: 38px;
		font-size: 95%;
		max-width: 38px;
		margin: auto;
	}

	td.currentDay {
		color: var(--paper-item-icon-active-color);
		background-color: ${this._config.calEventBackgroundColor};
	}

	tr.cal {
		width: 100%;
	}

	ha-icon-button {
		--mdc-icon-size: 20px;
		--mdc-icon-button-size: 25px;
		color: ${this._config.calDateColor};
	}

	.calTableContainer {
		width: 100%;
	}

	.summary-event-div {
		padding-top: 3px;
	}

	.bullet-event-div-accepted {
		-webkit-border-radius: 8px;
		border-radius: 8px;
		border: 4px solid;
		height: 0;
		width: 0;
		display: inline-block;
		vertical-align: middle;
	}

	.bullet-event-div-declined {
		-webkit-border-radius: 8px;
		border-radius: 8px;
		border: 1px solid;
		height: 6px;
		width: 6px;
		display: inline-block;
		vertical-align: middle;
	}

	.bullet-event-span {
		overflow: hidden;
		white-space: nowrap;
		display: inline-block;
		vertical-align: middle;
		margin: 0 5px;
		text-decoration: none !important;
	}

	.summary-fullday-div-accepted {
		-webkit-border-radius: 5px;
		border-radius: 5px;
		border: 2px solid;
		border-left: 7px solid;
		padding: 0 4px;
		margin: 5px 0;
		height: 18px;
		line-height: 16px;
	}

	.summary-fullday-div-declined {
		-webkit-border-radius: 5px;
		border-radius: 5px;
		border: 1px solid;
		padding: 0 4px;
		margin: 5px 0;
		height: 18px;
		line-height: 16px;
	}

	.calIcon {
		--mdc-icon-size: 10px;
		width: 10px;
		height: 10px;
		padding-top: 0px;
		margin-top: -10px;
		margin-right: -1px;
		margin-left: -1px;
	}

	.calDateSelector {
		display: inline-block;
		min-width: 9em;
		text-align: center;
	}

	.loader {
		border: 4px solid #f3f3f3;
		border-top: 4px solid grey;
		border-radius: 50%;
		width: 14px;
		height: 14px;
		animation: spin 2s linear infinite;
		float: left;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
`;

export default style;
