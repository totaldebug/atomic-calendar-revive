import { HassConfig } from 'home-assistant-js-websocket';
import memoizeOne from 'memoize-one';

import { FrontendLocaleData, TimeFormat } from '../types/translation';

export const useAmPm = memoizeOne((locale: FrontendLocaleData): boolean => {
	if (locale.time_format === TimeFormat.language || locale.time_format === TimeFormat.system) {
		const testLanguage = locale.time_format === TimeFormat.language ? locale.language : undefined;
		const test = new Date().toLocaleString(testLanguage);
		return test.includes('AM') || test.includes('PM');
	}

	return locale.time_format === TimeFormat.am_pm;
});

export const formatTime = (dateObj: Date, locale: FrontendLocaleData, config: HassConfig) =>
	formatTimeMem(locale, config.time_zone).format(dateObj);

const formatTimeMem = memoizeOne(
	(locale: FrontendLocaleData, serverTimeZone: string) =>
		new Intl.DateTimeFormat(locale.language === 'en' && !useAmPm(locale) ? 'en-u-hc-h23' : locale.language, {
			hour: 'numeric',
			minute: '2-digit',
			hour12: useAmPm(locale),
			timeZone: locale.time_zone === 'server' ? serverTimeZone : undefined,
		}),
);
