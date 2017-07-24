/* eslint-disable */

try { require('debug-utils'); } catch (err) {};
global.Promise = require.requireActual('bluebird');
global.fetch = require.requireActual('isomorphic-fetch');
