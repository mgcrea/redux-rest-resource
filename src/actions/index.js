// @inspiration https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js

import {getActionType, getTypesScope, scopeType} from './../types';
import {applyTransformPipeline, buildTransformPipeline} from './transform';
import {parseUrlParams} from './../helpers/url';
import fetch, {buildFetchUrl, buildFetchOpts} from './../helpers/fetch';
import {isFunction, isString, pick, ucfirst, getPluralName} from './../helpers/util';
import {defaultTransformResponsePipeline} from './../defaults';

const SUPPORTED_FETCH_OPTS = ['url', 'method', 'headers', 'credentials', 'query', 'body'];
const SUPPORTED_REDUCE_OPTS = ['assignResponse', 'isArray', 'isPure'];

const getActionName = (actionId, {resourceName, resourcePluralName = getPluralName(resourceName), isArray = false} = {}) => (
  !resourceName
    ? actionId
    : `${actionId}${ucfirst(isArray ? resourcePluralName : resourceName)}`
);

const createAction = (actionId, {resourceName, resourcePluralName = getPluralName(resourceName), scope, ...actionOpts}) => {
  const type = scopeType(getActionType(actionId), scope);
  // Actual action function with two args
  // Context usage changes with resolved method:
  // - GET/DELETE will be used to resolve query params (eg. /users/:id)
  // - POST/PATCH will be used to resolve query params (eg. /users/:id) and as request body
  return (context, contextOpts = {}) => (dispatch, getState) => {
    // Prepare reduce options
    const reduceOpts = {
      ...pick(actionOpts, ...SUPPORTED_REDUCE_OPTS),
      ...pick(contextOpts, ...SUPPORTED_REDUCE_OPTS)
    };
    // Support pure actions
    if (actionOpts.isPure) {
      dispatch({type, status: 'resolved', options: reduceOpts, context});
      return Promise.resolve();
    }
    // First dispatch a pending action
    dispatch({type, status: 'pending', context});
    // Prepare fetch options
    const fetchOpts = {
      ...pick(actionOpts, ...SUPPORTED_FETCH_OPTS),
      ...pick(contextOpts, ...SUPPORTED_FETCH_OPTS)
    };
    // Support dynamic fetch options
    const resolvedfetchOpts = Object.keys(fetchOpts).reduce((soFar, key) => {
      soFar[key] = isFunction(fetchOpts[key]) ? fetchOpts[key](getState, {context, contextOpts, actionId}) : fetchOpts[key];
      return soFar;
    }, {});
    const {url, ...eligibleFetchOptions} = resolvedfetchOpts;
    // Build fetch url and options
    const urlParams = parseUrlParams(url);
    const finalFetchUrl = buildFetchUrl(context, {url, urlParams});
    const finalFetchOpts = buildFetchOpts(context, eligibleFetchOptions);
    return fetch(finalFetchUrl, finalFetchOpts)
      .then(applyTransformPipeline(buildTransformPipeline(defaultTransformResponsePipeline, actionOpts.transformResponse)))
      .then(payload => dispatch({type, status: 'resolved', context, options: reduceOpts, receivedAt: Date.now(), ...payload}))
      .catch((err) => {
        // Catch HttpErrors
        if (err.statusCode) {
          dispatch({
            type,
            status: 'rejected',
            code: err.statusCode,
            body: err.body,
            context,
            options: reduceOpts,
            receivedAt: Date.now()
          });
        // Catch regular Errors
        } else {
          dispatch({
            type,
            status: 'rejected',
            err,
            context,
            options: reduceOpts,
            receivedAt: Date.now()
          });
        }
        throw err;
      });
  };
};

const createActions = (
  actions = {},
  {
    resourceName,
    resourcePluralName = getPluralName(resourceName),
    scope = getTypesScope(resourceName),
    ...globalOpts
  } = {}
) => {
  const actionKeys = Object.keys(actions);
  return actionKeys.reduce((actionFuncs, actionId) => {
    // Add support for relative url override
    const {url} = actions[actionId];
    if (globalOpts.url && url && isString(url) && url.substr(0, 1) === '.') {
      actions[actionId] = {...actions[actionId], url: `${globalOpts.url}${url.substr(1)}`};
    }
    const actionOpts = {...globalOpts, ...actions[actionId]};
    const actionName = getActionName(actionId, {resourceName, resourcePluralName, isArray: actionOpts.isArray});
    actionFuncs[actionName] = createAction(actionId, {resourceName, resourcePluralName, scope, ...actionOpts});
    return actionFuncs;
  }, {});
};

export {getActionName, createAction, createActions};
