// https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js
// var User = $resource('/user/:userId', {userId:'@id'});

import {createAction, CreateActionOptions, createActions, getActionName} from './actions';
import {defaultActions} from './defaults';
import fetch, {HttpError} from './helpers/fetch';
import {mergeObjects, pick, getPluralName} from './helpers/util';
import {createReducer, createReducers, createRootReducer} from './reducers';
import {createType, createTypes, getTypesScope, scopeTypes} from './types';
import {ConfigActionsOptions, AsyncActionCreator, Reducer, Types, UnknownObject, ReduceOptions} from './typings';
export * from './defaults';
export {combineReducers, mergeReducers, reduceReducers} from './reducers/helpers';
export * from './typings';
export {fetch, HttpError};

export type CreateResourceOptions = CreateActionOptions & {
  url: string;
  name: string;
  pluralName?: string;
  actions?: ConfigActionsOptions;
  mergeDefaultActions?: boolean;
  pick?: string[];
  scope?: string;
};

export type Resource<T extends UnknownObject> = {
  actions: Record<string, AsyncActionCreator>;
  reducers: Reducer<T>;
  rootReducer: Reducer<T>;
  types: Types;
};

export function createResource<T extends UnknownObject = UnknownObject>({
  url,
  name: resourceName,
  pluralName: resourcePluralName = getPluralName(resourceName),
  actions: givenActions = {},
  mergeDefaultActions = true,
  pick: pickedActions = [],
  scope,
  ...otherOptions
}: CreateResourceOptions): Resource<T> {
  // Merge passed actions with common defaults
  let resolvedActions = mergeDefaultActions
    ? (mergeObjects({}, defaultActions, givenActions) as ConfigActionsOptions)
    : givenActions;
  // Eventually pick selected actions
  if (pickedActions.length) {
    resolvedActions = pick(resolvedActions, ...pickedActions) as ConfigActionsOptions;
  }
  const types = createTypes(resolvedActions, {resourceName, resourcePluralName, scope});
  const actions = createActions(resolvedActions, {resourceName, resourcePluralName, scope, url, ...otherOptions});
  const reducers = createReducers<T>(resolvedActions, otherOptions as ReduceOptions<T>);
  const rootReducer = createRootReducer<T>(reducers, {resourceName, scope});
  return {
    actions,
    reducers: rootReducer, // breaking change
    rootReducer,
    types
  };
}

export type CreateResourceActionOptions = CreateActionOptions & {
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
