// @inspiration https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js

import fetch from 'isomorphic-fetch';
import {getActionType} from './../types';
import {applyTransformPipeline, buildTransformPipeline} from './transform';
import {parseUrlParams, buildFetchUrl} from './url';

import {defaultHeaders, defaultTransformResponsePipeline} from './../defaults';
// const d = ::console.info;

class HttpError extends Error {
  constructor(statusCode = 500, {body, message = 'HttpError'}) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
    // Http
    this.statusCode = statusCode;
    this.status = statusCode;
    this.body = body;
  }
}

const includes = (array, key) =>
  array.indexOf(key) !== -1;

const pick = (obj, ...keys) =>
  keys.reduce((soFar, key) => {
    if (includes(keys, key) && obj[key]) {
      soFar[key] = obj[key]; // eslint-disable-line no-param-reassign
    }
    return soFar;
  }, {});

const ucfirst = str =>
  str.charAt(0).toUpperCase() + str.substr(1);

const getActionName = ({name, pluralName, actionKey, actionOpts = {}}) => {
  const actualPluralName = pluralName || `${name}s`;
  return `${actionKey}${ucfirst(actionOpts.isArray ? actualPluralName : name)}`;
};

const buildFetchOpts = ({context, actionOpts}) => {
  const opts = {
    headers: defaultHeaders
  };
  if (actionOpts.method) {
    opts.method = actionOpts.method;
  }
  if (actionOpts.headers) {
    opts.headers = {...opts.headers, ...actionOpts.headers};
  }
  if (actionOpts.credentials) {
    opts.credentials = actionOpts.credentials;
  }
  const hasBody = /^(POST|PUT|PATCH)$/i.test(opts.method);
  if (context && hasBody) {
    opts.body = JSON.stringify(context);
  }
  return opts;
};

const isSuccess = status => status >= 200 && status < 300;

const createActions = ({name, pluralName, url: defaultUrl, actions = {}, credentials}) => (
  Object.keys(actions).reduce((actionFuncs, actionKey) => {
    const action = actions[actionKey];
    const actionOpts = {...actions[actionKey], credentials};
    const reducerOpts = pick(actionOpts, 'assignResponse');
    const type = getActionType({name, action, actionKey});
    const url = action.url || defaultUrl;
    const urlParams = parseUrlParams(url);
    // Compute actual function name
    const actionName = getActionName({name, pluralName, actionKey, actionOpts});
    // Actual action function
    const actionFunc = (context, contextOpts = {}) => (dispatch) => {
      // First dispatch a pending action
      dispatch({type, status: 'pending', context});
      const fetchUrl = buildFetchUrl({url, urlParams, context, contextOpts});
      const fetchOptions = buildFetchOpts({context, contextOpts, actionOpts});
      // d(`${name}Actions.${actionName}()`, fetchUrl, fetchOptions);
      return fetch(fetchUrl, fetchOptions)
        .then((res) => {
          if (!isSuccess(res.status)) {
            const contentType = res.headers.get('Content-Type');
            const isJson = contentType === 'application/json';
            return res[isJson ? 'json' : 'text']().then((body) => {
              throw new HttpError(res.status, {body});
            });
          }
          return res;
        })
        .then(applyTransformPipeline(buildTransformPipeline(defaultTransformResponsePipeline, actionOpts.transformResponse)))
        .then(payload => dispatch({type, status: 'resolved', context, options: reducerOpts, receivedAt: Date.now(), ...payload}))
        .catch((err) => {
          // Catch HttpErrors
          if (err.statusCode) {
            dispatch({type, status: 'rejected', code: err.statusCode, body: err.body, context, options: reducerOpts, receivedAt: Date.now()});
          // Catch regular Errors
          } else {
            dispatch({type, status: 'rejected', context, options: reducerOpts, err, receivedAt: Date.now()});
          }
          throw err;
        });
    };
    return {...actionFuncs, [actionName]: actionFunc};
  }, {})
);

export {getActionName, createActions};
