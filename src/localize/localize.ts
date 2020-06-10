import * as en from './languages/en.json';

var languages: any = {
  en: en,
};

export function localize(string: string, search: string = '', replace: string = '') {

  const lang = (localStorage.getItem('selectedLanguage') || 'en').replace(/['"]+/g, '').replace('-', '_');

  var tranlated: string;

  try {
    tranlated = string.split('.').reduce((o, i) => o[i], languages[lang]);
  } catch (e) {
    tranlated = string.split('.').reduce((o, i) => o[i], languages['en']);
  }

  if (tranlated === undefined) tranlated = string.split('.').reduce((o, i) => o[i], languages['en']);

  if (search !== '' && replace !== '') {
    tranlated = tranlated.replace(search, replace);
  }
  return tranlated;
}
