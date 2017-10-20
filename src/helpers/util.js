
export const includes = (array, key) =>
  array.indexOf(key) !== -1;

export const isObject = maybeObject =>
  typeof maybeObject === 'object';

export const pick = (obj, ...keys) =>
  keys.reduce((soFar, key) => {
    if (includes(keys, key) && obj[key] !== undefined) {
      soFar[key] = obj[key]; // eslint-disable-line no-param-reassign
    }
    return soFar;
  }, {});

export const startsWith = (string, target) =>
  String(string).slice(0, target.length) === target;

export const ucfirst = str =>
  str.charAt(0).toUpperCase() + str.substr(1);

export const upperSnakeCase = string =>
  String(string.split('').reduce((soFar, letter, index) => {
    const charCode = letter.charCodeAt(0);
    return soFar + (index && charCode < 97 ? `_${letter}` : letter).toUpperCase();
  }, ''));
