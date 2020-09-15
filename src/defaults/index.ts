import {ConfigActionOptions, DefaultActionVerb, State, UnknownObject} from '../typings';

const defaultActions: Record<DefaultActionVerb, ConfigActionOptions> = {
  create: {method: 'POST', assignResponse: true},
  fetch: {method: 'GET', isArray: true},
  get: {method: 'GET'},
  update: {method: 'PATCH'},
  updateMany: {method: 'PATCH', isArray: true, alias: 'update'},
  delete: {method: 'DELETE'},
  deleteMany: {method: 'DELETE', isArray: true, alias: 'delete'}
};

const defaultHeaders: RequestInit['headers'] = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

const defaultIdKeys = {
  singular: 'id',
  plural: 'ids'
};

const defaultState: Record<string, Partial<State>> = {
  create: {
    isCreating: false
  },
  fetch: {
    items: [],
    isFetching: false,
    lastUpdated: 0,
    didInvalidate: true
  },
  get: {
    item: null,
    isFetchingItem: false,
    lastUpdatedItem: 0,
    didInvalidateItem: true
  },
  update: {
    isUpdating: false
  },
  delete: {
    isDeleting: false
  }
};

const initialState: State = Object.keys(defaultState).reduce<State>(
  (soFar, key) => ({...soFar, ...defaultState[key]}),
  {} as State
);

export const defaultMergeItem = <T extends UnknownObject>(prevItem: T | null, nextItem: Partial<T>): T => {
  return Object.assign(prevItem || {}, nextItem) as T;
};

const defaultGlobals = {
  Promise,
  fetch
};

export {defaultGlobals, defaultActions, defaultHeaders, defaultIdKeys, defaultState, initialState};
