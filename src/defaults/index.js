/* global fetch */

const defaultActions = {
  create: {method: 'POST'},
  fetch: {method: 'GET', isArray: true},
  get: {method: 'GET', clearState: true},
  update: {method: 'PATCH'},
  updateMany: {method: 'PATCH', isArray: true, alias: 'update'},
  delete: {method: 'DELETE'},
  deleteMany: {method: 'DELETE', isArray: true, alias: 'delete'}
};

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

const defaultIdKeys = {
  singular: 'id',
  plural: 'ids'
};

const defaultState = {
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

const initialState = Object.keys(defaultState).reduce((soFar, key) => ({...soFar, ...defaultState[key]}), {});

const defaultGlobals = {
  Promise,
  fetch
};

export {defaultGlobals, defaultActions, defaultHeaders, defaultIdKeys, defaultState, initialState};
