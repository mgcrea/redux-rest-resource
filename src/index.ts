// https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js
// var User = $resource('/user/:userId', {userId:'@id'});

import {createAction, CreateActionOptions, createActions, getActionName} from './actions';
import {defaultActions} from './defaults';
import fetch, {HttpError} from './helpers/fetch';
import {mergeObjects, pick} from './helpers/util';
import {createReducer, createReducers, createRootReducer} from './reducers';
import {createType, createTypes, getTypesScope, scopeTypes} from './types';
import {ActionOptions, ActionsOptions, AsyncActionCreator, ReduceOptions, Reducer, Types} from './typings';
export * from './defaults';
export {combineReducers, mergeReducers, reduceReducers} from './reducers/helpers';
export * from './typings';
export {fetch, HttpError};

export type CreateResourceOptions = {
  name: string;
  url: string;
  pluralName: string;
  actions: Record<string, ActionOptions>;
  mergeDefaultActions: boolean;
  pick: string[];
  scope?: string;
};

export type Resource = {
  actions: Record<string, AsyncActionCreator>;
  reducers: Reducer;
  rootReducer: Reducer;
  types: Types;
};

export function createResource({
  url,
  name: resourceName,
  pluralName: resourcePluralName,
  actions: givenActions = {},
  mergeDefaultActions = true,
  pick: pickedActions = [],
  scope
}: CreateResourceOptions): Resource {
  // Merge passed actions with common defaults
  let resolvedActions: ActionsOptions = mergeDefaultActions
    ? (mergeObjects({}, defaultActions, givenActions) as ActionsOptions)
    : givenActions;
  // Eventually pick selected actions
  if (pickedActions.length) {
    resolvedActions = pick(resolvedActions, ...pickedActions) as ActionsOptions;
  }
  const types = createTypes(resolvedActions, {resourceName, resourcePluralName, scope});
  const actions = createActions(resolvedActions, {resourceName, resourcePluralName, scope, url});
  const reducers = createReducers(resolvedActions, {});
  const rootReducer = createRootReducer(reducers, {resourceName, scope});
  return {
    actions,
    reducers: rootReducer, // breaking change
    rootReducer,
    types
  };
}

export type CreateResourceActionOptions = ReduceOptions &
  CreateActionOptions & {
    name: string;
    pluralName: string;
    method?: RequestInit['method'];
    isArray?: boolean;
  };

export type ResourceAction = {
  actions: Record<string, AsyncActionCreator>;
  reducers: Record<string, Reducer>;
  rootReducer: Reducer;
  types: Record<string, string>;
};

export function createResourceAction({
  name: resourceName,
  pluralName: resourcePluralName,
  method = 'GET',
  isArray = false,
  ...args
}: CreateResourceActionOptions): ResourceAction {
  const actionId = method.toLowerCase();
  const scope = getTypesScope(resourceName);
  const types = scopeTypes(createType(actionId, {resourceName, resourcePluralName, isArray}), scope);
  const actionName = getActionName(actionId, {resourceName, resourcePluralName});
  const actions = {[actionName]: createAction(actionId, {scope, isArray, ...args})};
  const reducers = {[actionId]: createReducer(actionId, args)};
  const rootReducer = createRootReducer(reducers, {resourceName, scope});
  return {
    actions,
    reducers, // new API
    rootReducer,
    types
  };
}
