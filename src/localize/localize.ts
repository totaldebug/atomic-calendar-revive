import * as da from './languages/da.json';
import * as de from './languages/de.json';
import * as en from './languages/en.json';
import * as et from './languages/et.json';
import * as fr from './languages/fr.json';
import * as nb from './languages/nb.json';
import * as sv from './languages/sv.json';


const languages: any = {
	da: da,
	de: de,
	en: en,
	et: et,
	fr: fr,
	nb: nb,
	sv: sv,
};

export function localize(string: string, search = '', replace = '') {
	const lang = (localStorage.getItem('selectedLanguage') || 'en').replace(/['"]+/g, '').replace('-', '_');

	let translated: string;

	try {
		translated = string.split('.').reduce((o, i) => o[i], languages[lang]);
	} catch (e) {
		translated = string.split('.').reduce((o, i) => o[i], languages['en']);
	}

	if (translated === undefined) translated = string.split('.').reduce((o, i) => o[i], languages['en']);

	if (search !== '' && replace !== '') {
		translated = translated.replace(search, replace);
	}
	return translated;
}
