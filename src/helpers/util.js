
export const includes = (array, key) =>
  array.indexOf(key) !== -1;

export const isString = maybeString =>
  typeof maybeString === 'string';

export const isObject = maybeObject =>
  typeof maybeObject === 'object';

export const isFunction = maybeFunction =>
  typeof maybeFunction === 'function';

export const pick = (obj, ...keys) =>
  keys.reduce((soFar, key) => {
    if (includes(keys, key) && obj[key] !== undefined) {
      soFar[key] = obj[key]; // eslint-disable-line no-param-reassign
    }
    return soFar;
  }, {});

export const mapObject = (object, func) =>
  Object.keys(object).reduce((soFar, key) => {
    soFar[key] = func(object[key]); // eslint-disable-line no-param-reassign
    return soFar;
  }, {});

export const mergeObjects = (object, ...sources) => {
  const {concat} = Array.prototype;
  const uniqueKeys = concat.apply(Object.keys(object), sources.map(Object.keys))
    .filter((value, index, self) => self.indexOf(value) === index);
  return uniqueKeys.reduce((soFar, key) => {
    soFar[key] = Object.assign(soFar[key] || {}, ...sources.map(source => source[key] || {})); // eslint-disable-line no-param-reassign
    return soFar;
  }, object);
};

export const startsWith = (string, target) =>
  String(string).slice(0, target.length) === target;

export const ucfirst = str =>
  str.charAt(0).toUpperCase() + str.substr(1);

export const upperSnakeCase = string =>
  String(string.split('').reduce((soFar, letter, index) => {
    const charCode = letter.charCodeAt(0);
    return soFar + (index && charCode < 97 ? `_${letter}` : letter).toUpperCase();
  }, ''));

export const getGerundName = name =>
  `${name.replace(/e$/, '')}ing`;

export const getPluralName = name =>
  `${name}s`;
