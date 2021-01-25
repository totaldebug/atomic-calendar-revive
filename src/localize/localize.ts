import * as en from './languages/en.json';

const languages: any = {
	en: en,
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
