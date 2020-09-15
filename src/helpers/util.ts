import {defaultIdKeys} from '../defaults';
import {Action, ContentRange} from '../typings';

// type UnknownObject = Record<string | number | symbol, unknown>;

export const includes = (array: unknown[], value: unknown): boolean => array.indexOf(value) !== -1;

export const isString = (maybeString: unknown): maybeString is string => typeof maybeString === 'string';

export const toString = (value: unknown): string => String(value);

export const isObject = (maybeObject: unknown): maybeObject is Record<string, unknown> =>
  typeof maybeObject === 'object';

export const isFunction = (maybeFunction: unknown): maybeFunction is Function => typeof maybeFunction === 'function';

export const pick = <T>(obj: T, ...keys: Array<keyof T>): Partial<T> =>
  keys.reduce<Partial<T>>((soFar, key) => {
    if (includes(keys, key) && obj[key] !== undefined) {
      soFar[key] = obj[key];
    }
    return soFar;
  }, {});

export const find = <T extends Record<string | number | symbol, unknown>>(
  collection: T[],
  query: Partial<T>
): T | undefined => {
  const queryKeys = Object.keys(query);
  let foundItem: T | undefined;
  collection.some((item) => {
    const doesMatch = !queryKeys.some((key) => item[key] !== query[key]);
    if (doesMatch) {
      foundItem = item;
    }
    return doesMatch;
  });
  return foundItem;
};

export const mapObject = <T extends Record<string | number | symbol, V>, V>(
  object: T,
  func: (v: V) => V
): Record<string | number | symbol, V> =>
  Object.keys(object).reduce<Record<string | number | symbol, V>>((soFar, key: string) => {
    soFar[key] = func(object[key]);
    return soFar;
  }, {});

type ObjectMap = Record<string, Record<string, unknown>>;

export const mergeObjects = (object: ObjectMap, ...sources: ObjectMap[]): ObjectMap => {
  const {concat} = Array.prototype;
  const uniqueKeys: string[] = concat
    .apply(Object.keys(object), sources.map(Object.keys))
    .filter((value: keyof ObjectMap, index: number, self: (keyof ObjectMap)[]) => self.indexOf(value) === index);
  return uniqueKeys.reduce<ObjectMap>((soFar, key) => {
    soFar[key] = Object.assign(soFar[key] || {}, ...sources.map((source) => source[key] || {}));
    return soFar;
  }, object);
};

export const startsWith = (string: string, target: string): boolean =>
  String(string).slice(0, target.length) === target;

export const endsWith = (string: string, target: string): boolean =>
  String(string).slice(string.length - target.length) === target;

export const ucfirst = (string: string): string => string.charAt(0).toUpperCase() + string.substr(1);

export const upperSnakeCase = (string: string): string =>
  String(
    string.split('').reduce((soFar, letter, index) => {
      const charCode = letter.charCodeAt(0);
      return soFar + (index && charCode < 97 ? `_${letter}` : letter).toUpperCase();
    }, '')
  );

export const getGerundName = (name: string): string => `${name.replace(/e$/, '')}ing`;

export const getPluralName = (name = ''): string => (name.endsWith('s') ? name : `${name}s`);

export const parseContentRangeHeader = (string: string): ContentRange | null => {
  if (typeof string === 'string') {
    const matches = string.match(/^(\w+) (\d+)-(\d+)\/(\d+|\*)/);
    if (matches) {
      return {
        unit: matches[1],
        first: +matches[2],
        last: +matches[3],
        length: matches[4] === '*' ? null : +matches[4]
      };
    }
  }
  return null;
};

export const getIdKey = (_action: Action, {multi = false}: {multi: boolean}): string =>
  multi ? defaultIdKeys.plural : defaultIdKeys.singular;
