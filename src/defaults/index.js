/* global fetch */

const defaultActions = {
  create: {method: 'POST', alias: 'save'},
  fetch: {method: 'GET', isArray: true},
  get: {method: 'GET'},
  update: {method: 'PATCH'},
  delete: {method: 'DELETE'}
};

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

const defaultTransformResponsePipeline = [
  res => res.json().then(body => ({body, code: res.status}))
];

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

export {
  defaultGlobals,
  defaultActions,
  defaultHeaders,
  defaultTransformResponsePipeline,
  defaultState,
  initialState
};
