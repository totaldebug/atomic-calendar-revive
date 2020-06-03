import * as en from './languages/en.json';

var languages = {
  en: en,
};

export function localize(string: string, search: string = '', replace: string = '') {
  const section = string.split('.')[0];
  const key = string.split('.')[1];

  const lang = (localStorage.getItem('selectedLanguage') || 'en').replace(/['"]+/g, '').replace('-', '_');

  var tranlated: string;

  try {
    tranlated = languages[lang][section][key];
  } catch (e) {
    tranlated = languages['en'][section][key];
  }

  if (tranlated === undefined) tranlated = languages['en'][section][key];

  if (search !== '' && replace !== '') {
    tranlated = tranlated.replace(search, replace);
  }
  return tranlated;
}
