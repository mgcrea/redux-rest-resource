/* eslint-disable */

try { require('debug-utils'); } catch (err) {};
global.Promise = require.requireActual('bluebird');
global.fetch = require.requireActual('isomorphic-fetch');
// global.log = require.requireActual('ololog').configure({time: true, stringify: {print: require('q-i').stringify}})
