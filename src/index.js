
// https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js
// var User = $resource('/user/:userId', {userId:'@id'});

import {defaultActions} from './defaults';
import {createActions} from './actions';
import {createReducers} from './reducers';
import {createTypes} from './types';
export {reduceReducers, combineReducers, mergeReducers} from './reducers/helpers';

const mergeObjects = (object, ...sources) => {
  const concat = Array.prototype.concat;
  const uniqueKeys = concat.apply(Object.keys(object), sources.map(Object.keys))
    .filter((value, index, self) => self.indexOf(value) === index);
  return uniqueKeys.reduce((soFar, key) => {
    soFar[key] = Object.assign(soFar[key] || {}, ...sources.map(source => source[key] || {})); // eslint-disable-line no-param-reassign
    return soFar;
  }, object);
};

export function createResource({name, url, actions = {}, ...args}) {
  const actionsOpts = mergeObjects({}, defaultActions, actions);
  return {
    actions: createActions({name, url, actions: actionsOpts, ...args}),
    reducers: createReducers({name, ...args}),
    types: createTypes({name, actions: actionsOpts, ...args})
  };
}
