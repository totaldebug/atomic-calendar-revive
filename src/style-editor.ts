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
		padding-left: 16px;
		background: var(--secondary-background-color);
	}
	ha-switch {
		padding-bottom: 8px;
		padding-top: 16px;
	}
	.mdc-label {
		margin-left: 12px;
		vertical-align: text-bottom;
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
`;
