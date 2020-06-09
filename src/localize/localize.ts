import * as en from './languages/en.json';

var languages = {
  en: en,
};

export function localize(string: string, search: string = '', replace: string = '') {
  const sections = string.split('.');
  for(var i=0;i<sections.length;i++){
    sections[i]="["+sections[i]+"]";
  }

  const key = string.split(/[\s.]+/);

  const lang = (localStorage.getItem('selectedLanguage') || 'en').replace(/['"]+/g, '').replace('-', '_');

  var tranlated: string;

  const section = sections.join("")

  try {
    tranlated = languages[lang] + section + [key];
    console.log(tranlated);
  } catch (e) {
    tranlated = languages['en']+section+[key];
  }

  if (tranlated === undefined) tranlated = languages['en']+section+[key];

  if (search !== '' && replace !== '') {
    tranlated = tranlated.replace(search, replace);
  }
  return tranlated;
}
