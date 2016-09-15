import {values} from 'lodash';
import configureMockStore from 'redux-mock-store';
import expect from 'expect';
import nock from 'nock';
import thunk from 'redux-thunk';

import {createResource, defaultActions, defaultHeaders} from '../../src';
import {getActionType} from '../../src/types';
import {createActions, getActionName} from '../../src/actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


try { require('debug-utils'); } catch (err) {}; // eslint-disable-line

// Configuration
const name = 'user';
const host = 'http://localhost:3000';
const url = `${host}/users/:id`;

describe('createActions', () => {
  it('should throw if name is undefined', () => {
    expect(() => {
      const actionFuncs = createActions();
      expect(actionFuncs).toBeA('object');
    }).toThrow();
  });
  it('should return an object with properly named keys', () => {
    const actionFuncs = createActions({name, url, actions: defaultActions});
    const expectedKeys = Object.keys(defaultActions).map(actionKey => getActionName({name, actionKey, actionOpts: defaultActions[actionKey]}));
    expect(Object.keys(actionFuncs)).toEqual(expectedKeys);
  });
  it('should return an object with properly typed values', () => {
    const actionFuncs = createActions({name, url, actions: defaultActions});
    const expectedValuesFn = action => expect(action).toBeA('function');
    values(actionFuncs).forEach(expectedValuesFn);
  });
});

describe('defaultActions', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  const actionFuncs = createActions({name, url, actions: defaultActions});
  it('.create()', (done) => {
    const actionKey = 'create';
    const action = getActionName({name, actionKey});
    const type = getActionType({name, actionKey});
    const context = {firstName: 'Olivier'};
    const body = {ok: true};
    const code = 200;
    nock(host)
      .post('/users', context)
      .reply(code, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'resolved', type, context, body, code, receivedAt: null}
    ];
    store.dispatch(actionFuncs[action](context))
      .then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toEqual(expectedActions);
      })
      .then(done)
      .catch(done);
  });
  it('.fetch()', (done) => {
    const actionKey = 'fetch';
    const action = getActionName({name, actionKey, actionOpts: {isArray: true}});
    const type = getActionType({name, actionKey});
    const context = {};
    const body = [{id: 1, firstName: 'Olivier'}];
    const code = 200;
    nock(host)
      .get('/users')
      .reply(code, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'resolved', type, context, body, code, receivedAt: null}
    ];
    store.dispatch(actionFuncs[action](context))
      .then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toEqual(expectedActions);
      })
      .then(done)
      .catch(done);
  });
  it('.fetch() with query params', (done) => {
    const actionKey = 'fetch';
    const action = getActionName({name, actionKey, actionOpts: {isArray: true}});
    const type = getActionType({name, actionKey});
    const context = {};
    const query = {foo: 'bar'};
    const body = [{id: 1, firstName: 'Olivier'}];
    const code = 200;
    nock(host)
      .get('/users')
      .query(query)
      .reply(code, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'resolved', type, context, body, code, receivedAt: null}
    ];
    store.dispatch(actionFuncs[action](context, {query}))
      .then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toEqual(expectedActions);
      })
      .then(done)
      .catch(done);
  });
  it('.fetch() with request errors', (done) => {
    const actionKey = 'fetch';
    const action = getActionName({name, actionKey, actionOpts: {isArray: true}});
    const type = getActionType({name, actionKey});
    const context = {};
    const err = {code: undefined, errno: undefined, message: 'request to http://localhost:3000/users failed, reason: something awful happened', name: 'FetchError', type: 'system'};
    nock(host)
      .get('/users')
      .replyWithError('something awful happened');
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'rejected', type, context, err, receivedAt: null}
    ];
    store.dispatch(actionFuncs[action](context))
      .then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions[1].err.name).toEqual(expectedActions[1].err.name);
        expect(actions[1].err.message).toEqual(expectedActions[1].err.message);
        actions[1].err = expectedActions[1].err;
        expect(actions).toEqual(expectedActions);
      })
      .then(done)
      .catch(done);
  });
  it('.fetch() with response errors', (done) => {
    const actionKey = 'fetch';
    const action = getActionName({name, actionKey, actionOpts: {isArray: true}});
    const type = getActionType({name, actionKey});
    const context = {};
    const body = {err: 'something awful happened'};
    const code = 400;
    nock(host)
      .get('/users')
      .reply(code, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'rejected', type, context, body, code, receivedAt: null}
    ];
    store.dispatch(actionFuncs[action](context))
      .then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toEqual(expectedActions);
      })
      .then(done)
      .catch(done);
  });
  it('.get()', (done) => {
    const actionKey = 'get';
    const action = getActionName({name, actionKey});
    const type = getActionType({name, actionKey});
    const context = {id: 1};
    const body = {id: 1, firstName: 'Olivier'};
    const code = 200;
    nock(host)
      .get(`/users/${context.id}`)
      .reply(code, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'resolved', type, context, body, code, receivedAt: null}
    ];
    store.dispatch(actionFuncs[action](context))
      .then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toEqual(expectedActions);
      })
      .then(done)
      .catch(done);
  });
  it('.update()', (done) => {
    const actionKey = 'update';
    const action = getActionName({name, actionKey});
    const type = getActionType({name, actionKey});
    const context = {id: 1, firstName: 'Olivier'};
    const body = {ok: true};
    const code = 200;
    nock(host)
      .patch(`/users/${context.id}`, context)
      .reply(code, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'resolved', type, context, body, code, receivedAt: null}
    ];
    store.dispatch(actionFuncs[action](context))
      .then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toEqual(expectedActions);
      })
      .then(done)
      .catch(done);
  });
  it('.delete()', (done) => {
    const actionKey = 'delete';
    const action = getActionName({name, actionKey});
    const type = getActionType({name, actionKey});
    const context = {id: 1};
    const body = {ok: true};
    const code = 200;
    nock(host)
      .delete(`/users/${context.id}`)
      .reply(code, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'resolved', type, context, body, code, receivedAt: null}
    ];
    store.dispatch(actionFuncs[action](context))
      .then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toEqual(expectedActions);
      })
      .then(done)
      .catch(done);
  });
});

describe('actionOptions', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  it('should handle `method` option', (done) => {
    const resource = createResource({name, url, actions: {...defaultActions, fetch: {method: 'PATCH'}}});
    const actionFuncs = resource.actions;
    const actionKey = 'fetch';
    const action = getActionName({name, actionKey, actionOpts: {isArray: true}});
    const type = getActionType({name, actionKey});
    const context = {};
    const body = [{id: 1, firstName: 'Olivier'}];
    const code = 200;
    nock(host).patch('/users')
      .reply(code, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'resolved', type, context, body, code, receivedAt: null}
    ];
    store.dispatch(actionFuncs[action](context))
      .then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toEqual(expectedActions);
      })
      .then(done)
      .catch(done);
  });
  it('should handle `headers` option', (done) => {
    const resource = createResource({name, url, actions: {...defaultActions, fetch: {headers: {'X-Custom-Header': 'barbaz'}}}});
    Object.assign(defaultHeaders, {'X-Custom-Default-Header': 'foobar'});
    const actionFuncs = resource.actions;
    const actionKey = 'fetch';
    const action = getActionName({name, actionKey, actionOpts: {isArray: true}});
    const type = getActionType({name, actionKey});
    const context = {};
    const body = [{id: 1, firstName: 'Olivier'}];
    const code = 200;
    nock(host, {
      reqheaders: {...defaultHeaders,
        'X-Custom-Default-Header': 'foobar',
        'X-Custom-Header': 'barbaz'
      }
    }).get('/users')
      .reply(code, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'resolved', type, context, body, code, receivedAt: null}
    ];
    store.dispatch(actionFuncs[action](context))
      .then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toEqual(expectedActions);
      })
      .then(done)
      .catch(done);
  });
});
