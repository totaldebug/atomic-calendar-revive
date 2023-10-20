import { FrontendLocaleData, TimeFormat } from 'custom-card-helpers';

/**
 * Formats a number based on the specified language with thousands separator(s) and decimal character for better legibility.
 * @param locale The user-selected language and number format, from `hass.locale`
 */
export const formatTime = (locale?: FrontendLocaleData): string => {
	let format: string | string[] | undefined;

	switch (locale?.time_format) {
		case TimeFormat.am_pm:
			format = 'hh:mma';
			break;
		case TimeFormat.twenty_four:
			format = 'HH:mm';
			break;
		case TimeFormat.system:
			format = undefined;
			break;
		default:
			format = undefined;
	}

	return format ? format.toString() : '';
};
