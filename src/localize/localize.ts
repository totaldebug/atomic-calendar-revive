import * as da from './languages/da.json';
import * as de from './languages/de.json';
import * as en from './languages/en.json';
import * as et from './languages/et.json';
import * as fi from './languages/fi.json';
import * as fr from './languages/fr.json';
import * as nb from './languages/nb.json';
import * as ru from './languages/ru.json';
import * as sl from './languages/sl.json';
import * as sv from './languages/sv.json';
import { globalData } from '../helpers/globals';

const languages: object = {
	da: da,
	de: de,
	en: en,
	et: et,
	fi: fi,
	fr: fr,
	nb: nb,
	sl: sl,
	sv: sv,
	ru: ru,
};

export function localize(string: string, search = '', replace = '') {
	const langFromLocalStorage = (localStorage.getItem('selectedLanguage') || 'en')
		.replace(/['"]+/g, '')
		.replace('-', '_');
	const lang = `${globalData.hass?.locale?.language || globalData.hass?.language || langFromLocalStorage}`;

	let translated: string;

	try {
		translated = string.split('.').reduce((o, i) => o[i], languages[lang]);
	} catch (e) {
		translated = string.split('.').reduce((o, i) => o[i], languages['en']);
	}

	if (translated === undefined) {
		translated = string.split('.').reduce((o, i) => o[i], languages['en']);
	}

	if (search !== '' && replace !== '') {
		translated = translated.replace(search, replace);
	}
	return translated;
}
