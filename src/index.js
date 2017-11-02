
// https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js
// var User = $resource('/user/:userId', {userId:'@id'});

import {defaultActions} from './defaults';
import {createActions} from './actions';
import {createReducers, createRootReducer} from './reducers';
import {createTypes} from './types';
import fetch, {HttpError} from './helpers/fetch';
import {pick, mergeObjects} from './helpers/util';

export * from './defaults';
export {reduceReducers, combineReducers, mergeReducers} from './reducers/helpers';
export {fetch, HttpError};

export function createResource({
  name: resourceName,
  pluralName: resourcePluralName,
  actions: givenActions = {},
  mergeDefaultActions = true,
  pick: pickedActions = [],
  ...args
}) {
  // Merge passed actions with common defaults
  let resolvedActions = mergeDefaultActions ? mergeObjects({}, defaultActions, givenActions) : givenActions;
  // Eventually pick selected actions
  if (pickedActions.length) {
    resolvedActions = pick(resolvedActions, ...pickedActions);
  }
  const types = createTypes(resolvedActions, {resourceName, resourcePluralName, ...args});
  const actions = createActions(resolvedActions, {resourceName, resourcePluralName, ...args});
  const reducers = createReducers(resolvedActions, {resourceName, resourcePluralName, ...args});
  const rootReducer = createRootReducer(resolvedActions, {resourceName, resourcePluralName, reducers, ...args});
  return {
    actions,
    reducers: rootReducer, // breaking change
    rootReducer,
    types
  };
}
