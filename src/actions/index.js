// @inspiration https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js

import fetch from 'isomorphic-fetch';
import {getActionType} from './../types';
import {applyTransformPipeline, buildTransformPipeline} from './transform';
import {parseUrlParams, buildFetchUrl} from './url';

import {defaultHeaders, defaultTransformResponsePipeline} from './../defaults';
// const d = ::console.info;

const ucfirst = (str) =>
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
    const type = getActionType({name, action, actionKey});
    const url = action.url || defaultUrl;
    const urlParams = parseUrlParams(url);
    // Compute actual function name
    const actionName = getActionName({name, pluralName, actionKey, actionOpts});
    // Actual action function
    const actionFunc = context => dispatch => {
      // First dispatch a pending action
      dispatch({type, status: 'pending', context});
      const fetchUrl = buildFetchUrl({url, urlParams, context});
      const fetchOptions = buildFetchOpts({context, actionOpts});
      // d(`${name}Actions.${actionName}()`, fetchUrl, fetchOptions);
      let statusCode;
      return fetch(fetchUrl, fetchOptions)
        .then(res => { statusCode = res.status; return res; })
        .then(applyTransformPipeline(buildTransformPipeline(defaultTransformResponsePipeline, actionOpts.transformResponse)))
        .then(payload => dispatch({type, status: isSuccess(statusCode) ? 'resolved' : 'rejected', context, receivedAt: Date.now(), ...payload}))
        .catch(err => dispatch({type, status: 'rejected', context, err, receivedAt: Date.now()}));
    };
    return {...actionFuncs, [actionName]: actionFunc};
  }, {})
);

export {getActionName, createActions};
