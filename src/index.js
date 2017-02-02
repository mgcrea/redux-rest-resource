
// https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js
// var User = $resource('/user/:userId', {userId:'@id'});

import {defaultActions} from './defaults';
import {createActions} from './actions';
import {createReducers} from './reducers';
import {createTypes} from './types';

export * from './defaults';
export {reduceReducers, combineReducers, mergeReducers} from './reducers/helpers';
export {HttpError, fetch} from './helpers/fetch';

const mergeObjects = (object, ...sources) => {
  const concat = Array.prototype.concat;
  const uniqueKeys = concat.apply(Object.keys(object), sources.map(Object.keys))
    .filter((value, index, self) => self.indexOf(value) === index);
  return uniqueKeys.reduce((soFar, key) => {
    soFar[key] = Object.assign(soFar[key] || {}, ...sources.map(source => source[key] || {})); // eslint-disable-line no-param-reassign
    return soFar;
  }, object);
};

export function createResource({name, url, actions = {}, pick = [], ...args}) {
  let actionsOpts = mergeObjects({}, defaultActions, actions);
  if (pick.length) {
    actionsOpts = pick.reduce((soFar, key) => ({...soFar, [key]: actionsOpts[key]}), {});
  }
  return {
    actions: createActions({name, url, actions: actionsOpts, ...args}),
    reducers: createReducers({name, ...args}),
    types: createTypes({name, actions: actionsOpts, ...args})
  };
}
