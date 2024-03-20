/* eslint-disable import/no-duplicates */
import * as ca from './languages/ca.json';
import * as cs from './languages/cs.json';
import * as da from './languages/da.json';
import * as de from './languages/de.json';
import * as en from './languages/en.json';
import * as en_GB from './languages/en.json';
import * as et from './languages/et.json';
import * as fi from './languages/fi.json';
import * as fr from './languages/fr.json';
import * as hu from './languages/hu.json';
import * as nb from './languages/nb.json';
import * as nl from './languages/nl.json';
import * as pt from './languages/pt.json';
import * as ru from './languages/ru.json';
import * as sk from './languages/sk.json';
import * as sl from './languages/sl.json';
import * as sv from './languages/sv.json';
import { FEATURE_REQUEST } from '../const';
import { globalData } from '../helpers/globals';

const languages: object = {
	ca,
	cs,
	da,
	de,
	en,
	'en-GB': en_GB,
	et,
	fi,
	fr,
	hu,
	nb,
	nl,
	pt,
	ru,
	sk,
	sl,
	sv,
};

const DEFAULT_LANG = 'en';

function getTranslatedString(key: string, lang: string): string | undefined {
	try {
		return key.split('.').reduce((o, i) => (o as Record<string, unknown>)[i], languages[lang]) as string;
	} catch (error) {
		console.error(`Error translating key "${key}" in language "${lang}":`, error);
		return undefined;
	}
}

let languageNotSupportedMessage = false;

export default function localize(key: string) {
	const lang =
		(globalData.hass?.locale?.language || globalData.hass?.language || localStorage.getItem('selectedLanguage')) ??
		DEFAULT_LANG;
	if (languages[lang]) {
		// eslint-disable-next-line no-var
		var translated = getTranslatedString(key, lang);
	} else {
		translated = getTranslatedString(key, DEFAULT_LANG);
		if (!languageNotSupportedMessage) {
			console.warn(`Language "${lang}" not supported by Atomic Calendar, request it ${FEATURE_REQUEST}`);
			languageNotSupportedMessage = true;
		}
	}

	return translated ?? key;
}
