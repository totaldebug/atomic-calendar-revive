import { css } from 'lit';

export const style = css`
	.option {
		padding: 4px 0px 4px;
		cursor: pointer;
	}
	.row {
		display: flex;
		pointer-events: none;
	}
	.title {
		padding-left: 16px;
		margin-top: -6px;
		pointer-events: none;
	}
	.secondary {
		padding-left: 40px;
		color: var(--secondary-text-color);
		pointer-events: none;
	}
	.values {
		padding: 16px;
		background: var(--secondary-background-color);
	}
	.entity-box {
		margin-top: 5px;
		padding: 8px;
		background-image: repeating-linear-gradient(
				27deg,
				#333333,
				#333333 11px,
				transparent 11px,
				transparent 14px,
				#333333 14px
			),
			repeating-linear-gradient(117deg, #333333, #333333 11px, transparent 11px, transparent 14px, #333333 14px),
			repeating-linear-gradient(207deg, #333333, #333333 11px, transparent 11px, transparent 14px, #333333 14px),
			repeating-linear-gradient(297deg, #333333, #333333 11px, transparent 11px, transparent 14px, #333333 14px);
		background-size:
			3px 100%,
			100% 3px,
			3px 100%,
			100% 3px;
		background-position:
			0 0,
			0 0,
			100% 0,
			0 100%;
		background-repeat: no-repeat;
	}
	.entity-options {
		padding: 16px;
	}
	.side-by-side {
		display: flex;
	}
	.side-by-side > * {
		flex: 1;
		padding-right: 4px;
	}
	.origin-calendar {
		width: 50%;
		margin-left: 35px;
	}
	.icon {
		--mdc-icon-size: 10px;
		width: 10px;
		height: 10px;
		padding-top: 0px;
		margin-top: -10px;
		margin-right: -1px;
		margin-left: -1px;
	}
	.mwc-text-field {
		width: 97%;
	}
	.sponsor {
		margin: 5px;
		padding: 8px;
		background-image: repeating-linear-gradient(
				27deg,
				#333333,
				#333333 11px,
				transparent 11px,
				transparent 14px,
				#333333 14px
			),
			repeating-linear-gradient(117deg, #333333, #333333 11px, transparent 11px, transparent 14px, #333333 14px),
			repeating-linear-gradient(207deg, #333333, #333333 11px, transparent 11px, transparent 14px, #333333 14px),
			repeating-linear-gradient(297deg, #333333, #333333 11px, transparent 11px, transparent 14px, #333333 14px);
		background-size:
			3px 100%,
			100% 3px,
			3px 100%,
			100% 3px;
		background-position:
			0 0,
			0 0,
			100% 0,
			0 100%;
		background-repeat: no-repeat;
		position: relative;
	}
	.badge {
		position: absolute;
		top: 0px;
		right: 0px;
	}
`;
