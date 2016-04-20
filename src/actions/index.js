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
  const _pluralName = pluralName || `${name}s`;
  return `${actionKey}${ucfirst(actionOpts.isArray ? _pluralName : name)}`;
};

const buildFetchOpts = ({context, actionOpts}) => {
  const opts = {
    headers: defaultHeaders
  };
  if (actionOpts.method) {
    opts.method = actionOpts.method;
  }
  const hasBody = /^(POST|PUT|PATCH)$/i.test(opts.method);
  if (context && hasBody) {
    opts.body = JSON.stringify(context);
  }
  return opts;
};

const createActions = ({name, pluralName, url, actions = {}}) => { // eslint-disable-line arrow-body-style
  const urlParams = parseUrlParams(url);
  return Object.keys(actions).reduce((actionFuncs, actionKey) => {
    const action = actions[actionKey];
    const actionOpts = actions[actionKey];
    const type = getActionType({name, action, actionKey});
    // Compute actual function name
    const actionName = getActionName({name, pluralName, actionKey, actionOpts});
    // Actual action function
    const actionFunc = context => dispatch => {
      // First dispatch a pending action
      dispatch({type, status: 'pending', context});
      const fetchUrl = buildFetchUrl({url, urlParams, context});
      const fetchOptions = buildFetchOpts({context, actionOpts});
      // d(`${name}Actions.${actionName}()`, fetchUrl, fetchOptions);
      return fetch(fetchUrl, fetchOptions)
        .then(applyTransformPipeline(buildTransformPipeline(defaultTransformResponsePipeline, actionOpts.transformResponse)))
        .then(body => dispatch({type, status: 'resolved', context, body, receivedAt: Date.now()}))
        .catch(err => dispatch({type, status: 'rejected', context, err, receivedAt: Date.now()}));
    };
    return {...actionFuncs, [actionName]: actionFunc};
  }, {});
};

export {getActionName, createActions};
