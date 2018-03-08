/* global fetch */

import {parseResponse} from './../helpers/fetch';
import {parseContentRangeHeader} from './../helpers/util';

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
  res => parseResponse(res).then((body) => {
    const transformedResponse = {body, code: res.status};
    // Add support for Content-Range parsing when a partial http code is used
    const isPartialContent = res.status === 206;
    if (isPartialContent) {
      transformedResponse.contentRange = parseContentRangeHeader(res.headers.get('Content-Range'));
    }
    return transformedResponse;
  })
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
