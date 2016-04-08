
// https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js
// var User = $resource('/user/:userId', {userId:'@id'});
// const d = ::console.info;

import {createActions} from './actions';
import {createReducers} from './reducers';
import {createTypes} from './types';

export function createResource({...args}) {
  const types = createTypes({...args});
  return {
    actions: createActions({types, ...args}),
    reducers: createReducers({types, ...args}),
    types
  };
}

// function parseUrl(url) {
//   const parser = document.createElement('a');
//   parser.href = url;
//   const {protocol, hostname, port, pathname, search, hash, host} = parser;
//   return {protocol, hostname, port, pathname, search, hash, host};
// }
