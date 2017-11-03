import {values} from 'lodash';
import configureMockStore from 'redux-mock-store';
import expect from 'expect';
import nock from 'nock';
import thunk from 'redux-thunk';

import {defaultActions, defaultHeaders} from '../../src';
import {createActions, getActionName} from '../../src/actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// Configuration
const resourceName = 'user';
const host = 'http://localhost:3000';
const url = `${host}/users/:id`;

describe('createActions', () => {
  describe('when using a resource', () => {
    it('should return an object with properly named keys', () => {
      const actionFuncs = createActions(defaultActions, {resourceName, url});
      const expectedKeys = ['createUser', 'fetchUsers', 'getUser', 'updateUser', 'deleteUser'];
      expect(Object.keys(actionFuncs)).toEqual(expectedKeys);
    });
    it('should return an object with properly typed values', () => {
      const actionFuncs = createActions(defaultActions, {resourceName, url});
      const expectedValuesFn = action => expect(typeof action).toBe('function');
      values(actionFuncs).forEach(expectedValuesFn);
    });
  });
  describe('when not using a resource', () => {
    it('should return an object with properly named keys', () => {
      const actionFuncs = createActions(defaultActions, {url});
      const expectedKeys = ['create', 'fetch', 'get', 'update', 'delete'];
      expect(Object.keys(actionFuncs)).toEqual(expectedKeys);
    });
    it('should return an object with properly typed values', () => {
      const actionFuncs = createActions(defaultActions, {resourceName, url});
      const expectedValuesFn = action => expect(typeof action).toBe('function');
      values(actionFuncs).forEach(expectedValuesFn);
    });
  });
});

describe('defaultActions', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  const actionFuncs = createActions(defaultActions, {resourceName, url});

  describe('crudOperations', () => {
    it('.create()', () => {
      const actionId = 'create';
      const action = getActionName(actionId, {resourceName});
      const type = '@@resource/USER/CREATE';
      const context = {firstName: 'Olivier'};
      const body = {ok: true};
      const code = 200;
      const options = {};
      nock(host)
        .post('/users', context)
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then((res) => {
          res.receivedAt = null;
          expect(res).toEqual(expectedActions[1]);
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('.fetch()', () => {
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host)
        .get('/users')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then((res) => {
          res.receivedAt = null;
          expect(res).toEqual(expectedActions[1]);
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('.get()', () => {
      const actionId = 'get';
      const action = getActionName(actionId, {resourceName});
      const type = '@@resource/USER/GET';
      const context = {id: 1};
      const body = {id: 1, firstName: 'Olivier'};
      const code = 200;
      const options = {};
      nock(host)
        .get(`/users/${context.id}`)
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then((res) => {
          res.receivedAt = null;
          expect(res).toEqual(expectedActions[1]);
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('.update()', () => {
      const actionId = 'update';
      const action = getActionName(actionId, {resourceName});
      const type = '@@resource/USER/UPDATE';
      const context = {id: 1, firstName: 'Olivier'};
      const body = {ok: true};
      const code = 200;
      const options = {};
      nock(host)
        .patch(`/users/${context.id}`, context)
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then((res) => {
          res.receivedAt = null;
          expect(res).toEqual(expectedActions[1]);
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('.delete()', () => {
      const actionId = 'delete';
      const action = getActionName(actionId, {resourceName});
      const type = '@@resource/USER/DELETE';
      const context = {id: 1};
      const body = {ok: true};
      const code = 200;
      const options = {};
      nock(host)
        .delete(`/users/${context.id}`)
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then((res) => {
          res.receivedAt = null;
          expect(res).toEqual(expectedActions[1]);
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
  });

  describe('errorHandling', () => {
    it('.fetch() with request errors', () => {
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const options = {isArray: true};
      const err = {
        code: undefined,
        errno: undefined,
        message: 'request to http://localhost:3000/users failed, reason: something awful happened',
        name: 'FetchError',
        type: 'system'
      };
      nock(host)
        .get('/users')
        .replyWithError('something awful happened');
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'rejected', type, context, options, err, receivedAt: null}
      ];
      return expect(store.dispatch(actionFuncs[action](context)))
        .rejects.toBeDefined()
        .catch(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions[1].err.name).toEqual(expectedActions[1].err.name);
          expect(actions[1].err.message).toEqual(expectedActions[1].err.message);
          actions[1].err = expectedActions[1].err;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('.fetch() with JSON response errors', () => {
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = {err: 'something awful happened'};
      const code = 400;
      const options = {};
      nock(host)
        .get('/users')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'rejected', type, context, options, body, code, receivedAt: null}
      ];
      return expect(store.dispatch(actionFuncs[action](context)))
        .rejects.toBeDefined()
        .catch((err) => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(err.statusCode).toEqual(code);
          expect(actions).toEqual(expectedActions);
        });
    });
    it('.fetch() with HTML response errors', () => {
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = '<html><body><h1>something awful happened</h1></body></html>';
      const code = 400;
      const options = {};
      nock(host)
        .get('/users')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'rejected', type, context, options, body, code, receivedAt: null}
      ];
      return expect(store.dispatch(actionFuncs[action](context)))
        .rejects.toBeDefined()
        .catch((err) => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(err.statusCode).toEqual(code);
          expect(actions).toEqual(expectedActions);
        });
    });
  });
});

describe('custom actions', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  const customActions = {promote: {method: 'POST', url: `${url}/promote`}, merge: {method: 'POST', isArray: true}};
  const actionFuncs = createActions(customActions, {resourceName, url});
  it('.promote()', () => {
    const actionId = 'promote';
    const action = getActionName(actionId, {resourceName});
    const type = '@@resource/USER/PROMOTE';
    const context = {id: 1, firstName: 'Olivier'};
    const body = {ok: true};
    const code = 200;
    const options = {};
    nock(host)
      .post(`/users/${context.id}/promote`, context)
      .reply(code, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'resolved', type, context, options, body, code, receivedAt: null}
    ];
    return store.dispatch(actionFuncs[action](context))
      .then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toEqual(expectedActions);
      });
  });
  it('.merge()', () => {
    const actionId = 'merge';
    const action = getActionName(actionId, {resourceName, isArray: true});
    const type = '@@resource/USER/MERGE';
    const context = {};
    const body = [{id: 1, firstName: 'Olivier'}];
    const code = 200;
    const options = {isArray: true};
    nock(host)
      .post('/users')
      .reply(code, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'resolved', type, context, options, body, code, receivedAt: null}
    ];
    return store.dispatch(actionFuncs[action](context))
      .then((res) => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toEqual(expectedActions);
        expect(res.body).toEqual(actions[1].body);
      });
  });
});

describe('custom pure actions', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  const customActions = {
    clear: {
      isPure: true,
      reduce: (state, action) => ({...state, item: null})
    }
  };
  const actionFuncs = createActions(customActions, {resourceName, url});
  it('.clear()', () => {
    const actionId = 'clear';
    const action = getActionName(actionId, {resourceName});
    const type = '@@resource/USER/CLEAR';
    const context = {id: 1, firstName: 'Olivier'};
    const store = mockStore({users: {}});
    const options = {isPure: true};
    const expectedActions = [
      {status: 'resolved', type, context, options}
    ];
    return store.dispatch(actionFuncs[action](context))
      .then(() => {
        const actions = store.getActions();
        expect(actions).toEqual(expectedActions);
      });
  });
});

describe('fetch options', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  const checkActionMethodSignature = (getState, {actionId} = {}) => {
    expect(typeof getState).toBe('function');
    expect(typeof actionId).toBe('string');
    expect(typeof getState()).toBe('object');
  };
  describe('`url` option', () => {
    it('should support action override', () => {
      const overridenUrl = `${host}/teams/:id`;
      const actionFuncs = createActions({...defaultActions, fetch: {...defaultActions.fetch, url: overridenUrl}}, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/teams')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support action override via function', () => {
      const overridenUrl = (...args) => {
        checkActionMethodSignature(...args);
        return `${host}/teams/:id`;
      };
      const actionFuncs = createActions({...defaultActions, fetch: {...defaultActions.fetch, url: overridenUrl}}, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/teams')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support context override', () => {
      const overridenUrl = `${host}/teams/:id`;
      const actionFuncs = createActions(defaultActions, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/teams')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context, {url: overridenUrl}))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support relative urls', () => {
      const overridenUrl = './merge';
      const actionFuncs = createActions({...defaultActions, update: {...defaultActions.update, url: overridenUrl}}, {resourceName, url});
      const actionId = 'update';
      const action = getActionName(actionId, {resourceName});
      const type = '@@resource/USER/UPDATE';
      const context = {id: 1, firstName: 'Olivier'};
      const body = {ok: 1};
      const code = 200;
      const options = {};
      nock(host)
        .patch(`/users/${context.id}/merge`, context)
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
  });
  describe('`method` option', () => {
    it('should support action override', () => {
      const method = 'PATCH';
      const actionFuncs = createActions({...defaultActions, fetch: {...defaultActions.fetch, method}}, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).patch('/users')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support action override via function', () => {
      const method = (...args) => {
        checkActionMethodSignature(...args);
        return 'PATCH';
      };
      const actionFuncs = createActions({...defaultActions, fetch: {...defaultActions.fetch, method}}, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).patch('/users')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support context override', () => {
      const method = 'PATCH';
      const actionFuncs = createActions(defaultActions, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).patch('/users')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context, {method}))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
  });
  describe('`query` option', () => {
    it('should support action override', () => {
      const query = {foo: 'bar'};
      const actionFuncs = createActions({...defaultActions, fetch: {...defaultActions.fetch, query}}, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/users?foo=bar')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support action override via function', () => {
      const query = (...args) => {
        checkActionMethodSignature(...args);
        return {foo: 'bar'};
      };
      const actionFuncs = createActions({...defaultActions, fetch: {...defaultActions.fetch, query}}, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/users?foo=bar')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support context override', () => {
      const query = {foo: 'bar'};
      const actionFuncs = createActions(defaultActions, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/users?foo=bar')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context, {query}))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support non-string query params', () => {
      const query = {select: ['firstName', 'lastName'], populate: [{path: 'team', model: 'Team', select: ['id', 'name']}]};
      const actionFuncs = createActions(defaultActions, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/users?select=[%22firstName%22,%22lastName%22]&populate=[%7B%22path%22:%22team%22,%22model%22:%22Team%22,%22select%22:[%22id%22,%22name%22]%7D]')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context, {query}))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
  });
  describe('`headers` option', () => {
    Object.assign(defaultHeaders, {'X-Custom-Default-Header': 'foobar'});
    it('should support defaults override', () => {
      const actionFuncs = createActions(defaultActions, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/users')
        .matchHeader('X-Custom-Default-Header', 'foobar')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support action override', () => {
      const headers = {'X-Custom-Header': 'foobar'};
      const actionFuncs = createActions({...defaultActions, fetch: {...defaultActions.fetch, headers}}, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/users')
        .matchHeader('X-Custom-Header', 'foobar')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support action override via function', () => {
      const headers = (...args) => {
        checkActionMethodSignature(...args);
        return {'X-Custom-Header': 'foobar'};
      };
      const actionFuncs = createActions({...defaultActions, fetch: {...defaultActions.fetch, headers}}, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/users')
        .matchHeader('X-Custom-Header', 'foobar')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support context override', () => {
      const headers = {'X-Custom-Header': 'foobar'};
      const actionFuncs = createActions(defaultActions, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/users')
        .matchHeader('X-Custom-Header', 'foobar')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context, {headers}))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
  });
  describe('`credentials` option', () => {
    it('should support action override', () => {
      const credentials = 'include';
      const actionFuncs = createActions({...defaultActions, fetch: {...defaultActions.fetch, credentials}}, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/users')
        // .matchHeader('Access-Control-Allow-Origin', '*')
        // .matchHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support action override via function', () => {
      const credentials = (...args) => {
        checkActionMethodSignature(...args);
        return 'include';
      };
      const actionFuncs = createActions({...defaultActions, fetch: {...defaultActions.fetch, credentials}}, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/users')
        // .matchHeader('Access-Control-Allow-Origin', '*')
        // .matchHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support context override', () => {
      const credentials = 'include';
      const actionFuncs = createActions(defaultActions, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/users')
        // .matchHeader('Access-Control-Allow-Origin', '*')
        // .matchHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context, {credentials}))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
  });
  describe('`body` option', () => {
    it('should support context override', () => {
      const contextBody = {firstName: 'Olivier'};
      const actionFuncs = createActions(defaultActions, {resourceName, url});
      const actionId = 'update';
      const action = getActionName(actionId, {resourceName});
      const type = '@@resource/USER/UPDATE';
      const context = {id: 1};
      const body = {ok: true};
      const code = 200;
      const options = {};
      nock(host)
        .patch(`/users/${context.id}`, contextBody)
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context, {body: contextBody}))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
  });
  describe('`headers` option', () => {
    Object.assign(defaultHeaders, {'X-Custom-Default-Header': 'foobar'});
    it('should support defaults override', () => {
      const actionFuncs = createActions(defaultActions, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/users')
        .matchHeader('X-Custom-Default-Header', 'foobar')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support action override', () => {
      const headers = {'X-Custom-Header': 'foobar'};
      const actionFuncs = createActions({...defaultActions, fetch: {...defaultActions.fetch, headers}}, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/users')
        .matchHeader('X-Custom-Header', 'foobar')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support action override via function', () => {
      const headers = (...args) => {
        checkActionMethodSignature(...args);
        return {'X-Custom-Header': 'foobar'};
      };
      const actionFuncs = createActions({...defaultActions, fetch: {...defaultActions.fetch, headers}}, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/users')
        .matchHeader('X-Custom-Header', 'foobar')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support context override', () => {
      const headers = {'X-Custom-Header': 'foobar'};
      const actionFuncs = createActions(defaultActions, {resourceName, url});
      const actionId = 'fetch';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [{id: 1, firstName: 'Olivier'}];
      const code = 200;
      const options = {isArray: true};
      nock(host).get('/users')
        .matchHeader('X-Custom-Header', 'foobar')
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context, {headers}))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
  });
});

describe('reduce options', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  describe('`isArray` option', () => {
    it('should support action override', () => {
      const isArray = true;
      const actionFuncs = createActions({...defaultActions, update: {...defaultActions.update, isArray}}, {resourceName, url});
      const actionId = 'update';
      const action = getActionName(actionId, {resourceName, isArray: true});
      const type = '@@resource/USER/UPDATE';
      const context = {id: 1, firstName: 'Olivier'};
      const body = {ok: 1};
      const code = 200;
      const options = {isArray: true};
      nock(host).patch(`/users/${context.id}`, context)
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support context override', () => {
      const isArray = true;
      const actionFuncs = createActions(defaultActions, {resourceName, url});
      const actionId = 'update';
      const action = getActionName(actionId, {resourceName});
      const type = '@@resource/USER/UPDATE';
      const context = {id: 1, firstName: 'Olivier'};
      const body = {ok: 1};
      const code = 200;
      const options = {isArray: true};
      nock(host).patch(`/users/${context.id}`, context)
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context, {isArray}))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
  });
  describe('`assignResponse` option', () => {
    it('should support action override', () => {
      const assignResponse = true;
      const actionFuncs = createActions({...defaultActions, update: {...defaultActions.update, assignResponse}}, {resourceName, url});
      const actionId = 'update';
      const action = getActionName(actionId, {resourceName});
      const type = '@@resource/USER/UPDATE';
      const context = {id: 1, firstName: 'Olivier'};
      const body = {ok: 1};
      const code = 200;
      const options = {assignResponse: true};
      nock(host).patch(`/users/${context.id}`, context)
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
    it('should support context override', () => {
      const assignResponse = true;
      const actionFuncs = createActions(defaultActions, {resourceName, url});
      const actionId = 'update';
      const action = getActionName(actionId, {resourceName});
      const type = '@@resource/USER/UPDATE';
      const context = {id: 1, firstName: 'Olivier'};
      const body = {ok: 1};
      const code = 200;
      const options = {assignResponse: true};
      nock(host).patch(`/users/${context.id}`, context)
        .reply(code, body);
      const store = mockStore({users: {}});
      const expectedActions = [
        {status: 'pending', type, context},
        {status: 'resolved', type, context, options, body, code, receivedAt: null}
      ];
      return store.dispatch(actionFuncs[action](context, {assignResponse}))
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toEqual(expectedActions);
        });
    });
  });
});
