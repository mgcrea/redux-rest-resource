// @inspiration https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js

import {getActionType} from './../types';
import {applyTransformPipeline, buildTransformPipeline} from './transform';
import {parseUrlParams} from './../helpers/url';
import fetch, {buildFetchUrl, buildFetchOpts} from './../helpers/fetch';
import {pick, ucfirst} from './../helpers/util';

import {defaultTransformResponsePipeline} from './../defaults';
// const d = ::console.info;

const getActionName = ({name, pluralName, actionKey, actionOpts = {}}) => {
  const actualPluralName = pluralName || `${name}s`;
  return `${actionKey}${ucfirst(actionOpts.isArray ? actualPluralName : name)}`;
};

const createActions = ({name, pluralName, url: defaultUrl, actions = {}, credentials}) => (
  Object.keys(actions).reduce((actionFuncs, actionKey) => {
    const action = actions[actionKey];
    const actionOpts = {...actions[actionKey], credentials};
    const reducerOpts = pick(actionOpts, 'assignResponse');
    const type = getActionType({name, action, actionKey});
    const actionUrl = action.url || defaultUrl;
    // Compute actual function name
    const actionName = getActionName({name, pluralName, actionKey, actionOpts});
    // Actual action function
    const actionFunc = (context, contextOpts = {}) => (dispatch, getState) => {
      // First dispatch a pending action
      dispatch({type, status: 'pending', context});
      let url = actionUrl;
      if (typeof actionUrl === 'function') { url = actionUrl(getState); }
      const urlParams = parseUrlParams(url);
      const fetchUrl = buildFetchUrl({url, urlParams, context, contextOpts});
      const dynamicOpts = {};
      Object.keys(actionOpts).forEach((key) => {
        if (typeof actionOpts[key] === 'function') {
          dynamicOpts[key] = actionOpts[key](getState);
        }
      });
      const fetchOptions = buildFetchOpts({context, contextOpts, actionOpts: Object.assign({}, actionOpts, dynamicOpts)});
      // d(`${name}Actions.${actionName}()`, fetchUrl, fetchOptions);
      return fetch(fetchUrl, fetchOptions)
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
