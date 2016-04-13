// @inspiration https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js

import fetch from 'isomorphic-fetch';
import {getActionType} from './../types';
import {applyTransformPipeline, buildTransformPipeline} from './transform';
import {parseUrlParams, buildFetchUrl} from './url';

import {defaultActions, defaultHeaders, defaultTransformResponsePipeline} from './../defaults';
// const d = ::console.info;
const getActionName = ({name, actionKey, actionOpts = {}}) => `${actionKey}${name.charAt(0).toUpperCase()}${name.substr(1)}${actionOpts.isArray ? 's' : ''}`;

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


const createActions = ({name, actions = {}, url}) => { // eslint-disable-line arrow-body-style
  const urlParams = parseUrlParams(url);
  return Object.keys(defaultActions).reduce((actionFuncs, actionKey) => {
    const type = getActionType({name, actionKey});
    // Extend defaultActions with passed actions opts
    const actionOpts = {...(actions[actionKey] || {}), ...defaultActions[actionKey]};
    // Compute actual function name
    const actionName = getActionName({name, actionKey, actionOpts});
    // Actual action function
    const actionFunc = context => dispatch => {
      // First dispatch a pending action
      dispatch({type, status: 'pending', context});
      const fetchUrl = buildFetchUrl({url, urlParams, context});
      // d('fetchUrl', fetchUrl);
      const fetchOptions = buildFetchOpts({context, actionOpts});
      // d(`${name}Actions.${actionName}()`, fetchUrl, fetchOptions);
      return fetch(fetchUrl, fetchOptions)
        .then(applyTransformPipeline(buildTransformPipeline(defaultTransformResponsePipeline, actionOpts.transformResponse)))
        .then(body => dispatch({type, status: 'resolved', context, body, receivedAt: Date.now()}))
        .catch(err => dispatch({type, status: 'rejected', context, err, receivedAt: Date.now()}));
    };
    return Object.assign(actionFuncs, {[actionName]: actionFunc});
  }, {});
};

export {defaultActions, defaultHeaders, getActionName, createActions};
