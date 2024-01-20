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
import * as ru from './languages/ru.json';
import * as sl from './languages/sl.json';
import * as sv from './languages/sv.json';
import { globalData } from '../helpers/globals';

const languages: object = {
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
	ru,
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

export default function localize(key: string) {
	const lang =
		(globalData.hass?.locale?.language || globalData.hass?.language || localStorage.getItem('selectedLanguage')) ??
		DEFAULT_LANG;
	let translated = getTranslatedString(key, lang);
	if (!translated) {
		translated = getTranslatedString(key, DEFAULT_LANG);
	}
	return translated ?? key;
}
