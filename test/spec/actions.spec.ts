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

const checkActionMethodSignature = (getState, {actionId} = {}) => {
  expect(typeof getState).toBe('function');
  expect(typeof actionId).toBe('string');
  expect(typeof getState()).toBe('object');
};

describe('createActions', () => {
  describe('when using a resource', () => {
    it('should return an object with properly named keys', () => {
      const actionFuncs = createActions(defaultActions, {
        resourceName,
        url
      });
      const expectedKeys = [
        'createUser',
        'fetchUsers',
        'getUser',
        'updateUser',
        'updateUsers',
        'deleteUser',
        'deleteUsers'
      ];
      expect(Object.keys(actionFuncs)).toEqual(expectedKeys);
    });
    it('should return an object with properly typed values', () => {
      const actionFuncs = createActions(defaultActions, {
        resourceName,
        url
      });
      const expectedValuesFn = (action) => expect(typeof action).toBe('function');
      values(actionFuncs).forEach(expectedValuesFn);
    });
  });
  describe('when not using a resource', () => {
    it('should return an object with properly named keys', () => {
      const actionFuncs = createActions(defaultActions, {
        url
      });
      const expectedKeys = ['create', 'fetch', 'get', 'update', 'updateMany', 'delete', 'deleteMany'];
      expect(Object.keys(actionFuncs)).toEqual(expectedKeys);
    });
    it('should return an object with properly typed values', () => {
      const actionFuncs = createActions(defaultActions, {
        resourceName,
        url
      });
      const expectedValuesFn = (action) => expect(typeof action).toBe('function');
      values(actionFuncs).forEach(expectedValuesFn);
    });
  });
});

describe('defaultActions', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  const actionFuncs = createActions(defaultActions, {
    resourceName,
    url
  });

  describe('crudOperations', () => {
    it('.create()', () => {
      const actionId = 'create';
      const action = getActionName(actionId, {
        resourceName
      });
      const context = {
        firstName: 'Olivier'
      };
      const body = {
        ok: true
      };
      const code = 200;
      nock(host).post('/users', context).reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then((res) => {
        res.receivedAt = null;
        expect(res).toMatchSnapshot();
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('.fetch()', () => {
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;

      nock(host).get('/users').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then((res) => {
        res.receivedAt = null;
        expect(res).toMatchSnapshot();
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('.get()', () => {
      const actionId = 'get';
      const action = getActionName(actionId, {
        resourceName
      });
      const context = {
        id: 1
      };
      const body = {
        id: 1,
        firstName: 'Olivier'
      };
      const code = 200;
      nock(host).get(`/users/${context.id}`).reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then((res) => {
        res.receivedAt = null;
        expect(res).toMatchSnapshot();
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('.update()', () => {
      const actionId = 'update';
      const action = getActionName(actionId, {
        resourceName
      });
      const context = {
        id: 1,
        firstName: 'Olivier'
      };
      const body = {
        ok: true
      };
      const code = 200;
      nock(host).patch(`/users/${context.id}`, context).reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then((res) => {
        res.receivedAt = null;
        expect(res).toMatchSnapshot();
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('.delete()', () => {
      const actionId = 'delete';
      const action = getActionName(actionId, {
        resourceName
      });
      const context = {
        id: 1
      };
      const body = {
        ok: true
      };
      const code = 200;
      nock(host).delete(`/users/${context.id}`).reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then((res) => {
        res.receivedAt = null;
        expect(res).toMatchSnapshot();
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
  });

  describe('exoticResponses', () => {
    it('.fetch() with an exotic json Content-Type', () => {
      const actionId = 'get';
      const action = getActionName(actionId, {
        resourceName
      });
      const context = {
        id: 1
      };
      const body = {
        id: 1,
        firstName: 'Olivier'
      };
      const code = 200;
      nock(host).get(`/users/${context.id}`).reply(code, body, {
        'Content-Type': 'application/problem+json; charset=utf-8'
      });
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then((res) => {
        res.receivedAt = null;
        expect(res).toMatchSnapshot();
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('.fetch() with an empty body', () => {
      const actionId = 'delete';
      const action = getActionName(actionId, {
        resourceName
      });
      const context = {
        id: 1
      };
      const code = 200;
      nock(host).delete(`/users/${context.id}`).reply(code);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then((res) => {
        res.receivedAt = null;
        expect(res).toMatchSnapshot();
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('.fetch() with an non-json body', () => {
      const actionId = 'delete';
      const action = getActionName(actionId, {
        resourceName
      });
      const context = {
        id: 1
      };
      const body = 'foobar';
      const code = 200;
      nock(host).delete(`/users/${context.id}`).reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then((res) => {
        res.receivedAt = null;
        expect(res).toMatchSnapshot();
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
  });

  describe('errorHandling', () => {
    it('.fetch() with request errors', () => {
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      nock(host).get('/users').replyWithError('something awful happened');
      const store = mockStore({
        users: {}
      });
      return expect(store.dispatch(actionFuncs[action](context)))
        .rejects.toBeDefined()
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toMatchSnapshot();
        });
    });
    it('.fetch() with JSON response errors', () => {
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = {
        err: 'something awful happened'
      };
      const code = 400;
      nock(host).get('/users').reply(code, body);
      const store = mockStore({
        users: {}
      });
      let thrownErr;
      return expect(
        store.dispatch(actionFuncs[action](context)).catch((err) => {
          thrownErr = err;
          throw err;
        })
      )
        .rejects.toBeDefined()
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(thrownErr.status).toEqual(code);
          expect(actions).toMatchSnapshot();
        });
    });
    it('.fetch() with HTML response errors', () => {
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = '<html><body><h1>something awful happened</h1></body></html>';
      const code = 400;
      nock(host).get('/users').reply(code, body);
      const store = mockStore({
        users: {}
      });
      let thrownErr;
      return expect(
        store.dispatch(actionFuncs[action](context)).catch((err) => {
          thrownErr = err;
          throw err;
        })
      )
        .rejects.toBeDefined()
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(thrownErr.status).toEqual(code);
          expect(actions).toMatchSnapshot();
        });
    });
  });
});

describe('custom actions', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  const customActions = {
    promote: {
      method: 'POST',
      url: `${url}/promote`
    },
    applications: {
      name: 'fetchApplications',
      gerundName: 'fetchingApplications',
      method: 'GET',
      isArray: true,
      url: `${url}/applications`
    },
    merge: {
      method: 'POST',
      isArray: true
    },
    editFolder: {
      method: 'PATCH',
      url: `./folders/:folder`
    }
  };
  const actionFuncs = createActions(customActions, {
    resourceName,
    url
  });
  it('.promote()', () => {
    const actionId = 'promote';
    const action = getActionName(actionId, {
      resourceName
    });
    const context = {
      id: 1,
      firstName: 'Olivier'
    };
    const body = {
      ok: true
    };
    const code = 200;
    nock(host).post(`/users/${context.id}/promote`, context).reply(code, body);
    const store = mockStore({
      users: {}
    });
    return store.dispatch(actionFuncs[action](context)).then(() => {
      const actions = store.getActions();
      actions[1].receivedAt = null;
      expect(actions).toMatchSnapshot();
    });
  });
  it('with a custom action name', () => {
    const action = 'fetchApplications';
    const context = {
      id: 1
    };
    const body = [
      {
        id: 1,
        name: 'Foo'
      }
    ];
    const code = 200;
    nock(host).get(`/users/${context.id}/applications`).reply(code, body);
    const store = mockStore({
      users: {}
    });
    return store.dispatch(actionFuncs[action](context)).then(() => {
      const actions = store.getActions();
      actions[1].receivedAt = null;
      expect(actions).toMatchSnapshot();
    });
  });
  it('.merge()', () => {
    const actionId = 'merge';
    const action = getActionName(actionId, {
      resourceName,
      isArray: true
    });
    const context = {};
    const body = [
      {
        id: 1,
        firstName: 'Olivier'
      }
    ];
    const code = 200;
    nock(host).post('/users').reply(code, body);
    const store = mockStore({
      users: {}
    });
    return store.dispatch(actionFuncs[action](context)).then((res) => {
      const actions = store.getActions();
      actions[1].receivedAt = null;
      expect(actions).toMatchSnapshot();
      expect(res.body).toEqual(actions[1].body);
    });
  });
  it('.editFolder()', () => {
    const actionId = 'editFolder';
    const action = getActionName(actionId, {
      resourceName
    });
    const context = {
      id: 1,
      folder: 2,
      name: 'New Name'
    };
    const body = {
      folder: 2,
      name: 'New Name'
    };
    const code = 200;
    nock(host).patch(`/users/${context.id}/folders/${context.folder}`, context).reply(code, body);
    const store = mockStore({
      users: {}
    });
    return store.dispatch(actionFuncs[action](context)).then((res) => {
      const actions = store.getActions();
      actions[1].receivedAt = null;
      expect(actions).toMatchSnapshot();
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
      reduce: (state, _action) => ({
        ...state,
        item: null
      })
    }
  };
  const actionFuncs = createActions(customActions, {
    resourceName,
    url
  });
  it('.clear()', () => {
    const actionId = 'clear';
    const action = getActionName(actionId, {
      resourceName
    });
    const context = {
      id: 1,
      firstName: 'Olivier'
    };
    const store = mockStore({
      users: {}
    });
    return store.dispatch(actionFuncs[action](context)).then(() => {
      const actions = store.getActions();
      expect(actions).toMatchSnapshot();
    });
  });
});

describe('other options', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  describe('`alias` option', () => {
    it('should support action override', () => {
      const alias = 'grab';
      const actionFuncs = createActions(
        {
          ...defaultActions,
          fetch: {
            ...defaultActions.fetch,
            alias
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        alias,
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host).get('/users').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
  });
  describe('`name` option', () => {
    it('should support action override', () => {
      const name = 'grabWorkers';
      const actionFuncs = createActions(
        {
          ...defaultActions,
          fetch: {
            ...defaultActions.fetch,
            name
          }
        },
        {
          resourceName,
          url
        }
      );
      const action = name;
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host).get('/users').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
  });
});

describe('fetch options', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  describe('`transformResponse` option', () => {
    it('should support action options', () => {
      const transformResponse = (res) => ({
        ...res,
        body: res.body.map((item) => ({
          ...item,
          foo: 'bar'
        }))
      });
      const actionFuncs = createActions(
        {
          ...defaultActions,
          fetch: {
            ...defaultActions.fetch,
            transformResponse
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host).get('/users').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
  });
  describe('`url` option', () => {
    it('should support action override', () => {
      const overridenUrl = `${host}/teams/:id`;
      const actionFuncs = createActions(
        {
          ...defaultActions,
          fetch: {
            ...defaultActions.fetch,
            url: overridenUrl
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host).get('/teams').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('should support action override via function', () => {
      const overridenUrl = (...args) => {
        checkActionMethodSignature(...args);
        return `${host}/teams/:id`;
      };
      const actionFuncs = createActions(
        {
          ...defaultActions,
          fetch: {
            ...defaultActions.fetch,
            url: overridenUrl
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host).get('/teams').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('should support context override', () => {
      const overridenUrl = `${host}/teams/:id`;
      const actionFuncs = createActions(defaultActions, {
        resourceName,
        url
      });
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host).get('/teams').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store
        .dispatch(
          actionFuncs[action](context, {
            url: overridenUrl
          })
        )
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toMatchSnapshot();
        });
    });
    it('should support relative urls', () => {
      const overridenUrl = './merge';
      const actionFuncs = createActions(
        {
          ...defaultActions,
          update: {
            ...defaultActions.update,
            url: overridenUrl
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'update';
      const action = getActionName(actionId, {
        resourceName
      });
      const context = {
        id: 1,
        firstName: 'Olivier'
      };
      const body = {
        ok: 1
      };
      const code = 200;
      nock(host).patch(`/users/${context.id}/merge`, context).reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('should support relative urls for array methods', () => {
      const overridenUrl = './aggregate';
      const actionFuncs = createActions(
        {
          ...defaultActions,
          aggregate: {method: 'GET', gerundName: 'aggregating', url: overridenUrl, isArray: true}
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'aggregate';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = {
        ok: 1
      };
      const code = 200;
      nock(host).get(`/users/aggregate`).reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
  });
  describe('`method` option', () => {
    it('should support action override', () => {
      const method = 'PATCH';
      const actionFuncs = createActions(
        {
          ...defaultActions,
          fetch: {
            ...defaultActions.fetch,
            method
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host).patch('/users').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('should support action override via function', () => {
      const method = (...args) => {
        checkActionMethodSignature(...args);
        return 'PATCH';
      };
      const actionFuncs = createActions(
        {
          ...defaultActions,
          fetch: {
            ...defaultActions.fetch,
            method
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const type = '@@resource/USER/FETC';
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host).patch('/users').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('should support context override', () => {
      const method = 'PATCH';
      const actionFuncs = createActions(defaultActions, {
        resourceName,
        url
      });
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host).patch('/users').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store
        .dispatch(
          actionFuncs[action](context, {
            method
          })
        )
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toMatchSnapshot();
        });
    });
  });
  describe('`query` option', () => {
    it('should support action override', () => {
      const query = {
        foo: 'bar'
      };
      const actionFuncs = createActions(
        {
          ...defaultActions,
          fetch: {
            ...defaultActions.fetch,
            query
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host).get('/users?foo=bar').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('should support action override via function', () => {
      const query = (...args) => {
        checkActionMethodSignature(...args);
        return {
          foo: 'bar'
        };
      };
      const actionFuncs = createActions(
        {
          ...defaultActions,
          fetch: {
            ...defaultActions.fetch,
            query
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const type = '@@resource/USER/FETCH';
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      const options = {
        isArray: true
      };
      nock(host).get('/users?foo=bar').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('should support context override', () => {
      const query = {
        foo: 'bar'
      };
      const actionFuncs = createActions(defaultActions, {
        resourceName,
        url
      });
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host).get('/users?foo=bar').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store
        .dispatch(
          actionFuncs[action](context, {
            query
          })
        )
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toMatchSnapshot();
        });
    });
    it('should support non-string query params', () => {
      const query = {
        select: ['firstName', 'lastName'],
        populate: [
          {
            path: 'team',
            model: 'Team',
            select: ['id', 'name']
          }
        ]
      };
      const actionFuncs = createActions(defaultActions, {
        resourceName,
        url
      });
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host)
        .get(
          '/users?select=[%22firstName%22,%22lastName%22]&populate=[%7B%22path%22:%22team%22,%22model%22:%22Team%22,%22select%22:[%22id%22,%22name%22]%7D]'
        )
        .reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store
        .dispatch(
          actionFuncs[action](context, {
            query
          })
        )
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toMatchSnapshot();
        });
    });
  });
  describe('`headers` option', () => {
    Object.assign(defaultHeaders, {
      'X-Custom-Default-Header': 'foobar'
    });
    it('should support defaults override', () => {
      const actionFuncs = createActions(defaultActions, {
        resourceName,
        url
      });
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host).get('/users').matchHeader('X-Custom-Default-Header', 'foobar').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('should support action override', () => {
      const headers = {
        'X-Custom-Header': 'foobar'
      };
      const actionFuncs = createActions(
        {
          ...defaultActions,
          fetch: {
            ...defaultActions.fetch,
            headers
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;

      nock(host).get('/users').matchHeader('X-Custom-Header', 'foobar').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('should support action override via function', () => {
      const headers = (...args) => {
        checkActionMethodSignature(...args);
        return {
          'X-Custom-Header': 'foobar'
        };
      };
      const actionFuncs = createActions(
        {
          ...defaultActions,
          fetch: {
            ...defaultActions.fetch,
            headers
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;

      nock(host).get('/users').matchHeader('X-Custom-Header', 'foobar').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('should support context override', () => {
      const headers = {
        'X-Custom-Header': 'foobar'
      };
      const actionFuncs = createActions(defaultActions, {
        resourceName,
        url
      });
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;

      nock(host).get('/users').matchHeader('X-Custom-Header', 'foobar').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store
        .dispatch(
          actionFuncs[action](context, {
            headers
          })
        )
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toMatchSnapshot();
        });
    });
  });
  describe('`credentials` option', () => {
    it('should support action override', () => {
      const credentials = 'include';
      const actionFuncs = createActions(
        {
          ...defaultActions,
          fetch: {
            ...defaultActions.fetch,
            credentials
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;

      nock(host)
        .get('/users')
        // .matchHeader('Access-Control-Allow-Origin', '*')
        // .matchHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        .reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('should support action override via function', () => {
      const credentials = (...args) => {
        checkActionMethodSignature(...args);
        return 'include';
      };
      const actionFuncs = createActions(
        {
          ...defaultActions,
          fetch: {
            ...defaultActions.fetch,
            credentials
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host)
        .get('/users')
        // .matchHeader('Access-Control-Allow-Origin', '*')
        // .matchHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        .reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('should support context override', () => {
      const credentials = 'include';
      const actionFuncs = createActions(defaultActions, {
        resourceName,
        url
      });
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host)
        .get('/users')
        // .matchHeader('Access-Control-Allow-Origin', '*')
        // .matchHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        .reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store
        .dispatch(
          actionFuncs[action](context, {
            credentials
          })
        )
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toMatchSnapshot();
        });
    });
  });

  describe('`signal` option', () => {
    it('should support action override', () => {
      const controller = new AbortController();
      const {signal} = controller;
      // const timeoutId = setTimeout(() => controller.abort(), 100);
      const actionFuncs = createActions(
        {
          ...defaultActions,
          fetch: {
            ...defaultActions.fetch,
            signal
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host).get('/users').delayConnection(2000).reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
  });

  describe('`body` option', () => {
    it('should support context override', () => {
      const contextBody = {
        firstName: 'Olivier'
      };
      const actionFuncs = createActions(defaultActions, {
        resourceName,
        url
      });
      const actionId = 'update';
      const action = getActionName(actionId, {
        resourceName
      });
      const context = {
        id: 1
      };
      const body = {
        ok: true
      };
      const code = 200;
      nock(host).patch(`/users/${context.id}`, contextBody).reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store
        .dispatch(
          actionFuncs[action](context, {
            body: contextBody
          })
        )
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toMatchSnapshot();
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
      const actionFuncs = createActions(
        {
          ...defaultActions,
          create: {
            ...defaultActions.create,
            isArray
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'create';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {
        firstName: 'Olivier'
      };
      const body = {
        ok: 1
      };
      const code = 200;
      nock(host).post('/users', context).reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('should support context override', () => {
      const isArray = true;
      const actionFuncs = createActions(defaultActions, {
        resourceName,
        url
      });
      const actionId = 'update';
      const action = getActionName(actionId, {
        resourceName
      });
      const context = {
        id: 1,
        firstName: 'Olivier'
      };
      const body = {
        ok: 1
      };
      const code = 200;
      nock(host).patch(`/users/${context.id}`, context).reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store
        .dispatch(
          actionFuncs[action](context, {
            isArray
          })
        )
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toMatchSnapshot();
        });
    });
  });
  describe('`assignResponse` option', () => {
    it('should support action override', () => {
      const assignResponse = true;
      const actionFuncs = createActions(
        {
          ...defaultActions,
          update: {
            ...defaultActions.update,
            assignResponse
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'update';
      const action = getActionName(actionId, {
        resourceName
      });
      const context = {
        id: 1,
        firstName: 'Olivier'
      };
      const body = {
        ok: 1
      };
      const code = 200;
      nock(host).patch(`/users/${context.id}`, context).reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it('should support context override', () => {
      const assignResponse = true;
      const actionFuncs = createActions(defaultActions, {
        resourceName,
        url
      });
      const actionId = 'update';
      const action = getActionName(actionId, {
        resourceName
      });
      const context = {
        id: 1,
        firstName: 'Olivier'
      };
      const body = {
        ok: 1
      };
      const code = 200;
      nock(host).patch(`/users/${context.id}`, context).reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store
        .dispatch(
          actionFuncs[action](context, {
            assignResponse
          })
        )
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toMatchSnapshot();
        });
    });
  });

  // it('.get()', () => {
  //   const actionId = 'get';
  //   const action = getActionName(actionId, {
  //     resourceName
  //   });
  //   const context = {
  //     id: 1
  //   };
  //   const body = {
  //     id: 1,
  //     firstName: 'Olivier'
  //   };
  //   const code = 200;
  //   nock(host).get(`/users/${context.id}`).reply(code, body);
  //   const store = mockStore({
  //     users: {}
  //   });
  //   return store.dispatch(actionFuncs[action](context)).then((res) => {
  //     res.receivedAt = null;
  //     expect(res).toMatchSnapshot();
  //     const actions = store.getActions();
  //     actions[1].receivedAt = null;
  //     expect(actions).toMatchSnapshot();
  //   });
  // });
  describe('`mergeResponse` option', () => {
    it('should support action override', () => {
      const mergeResponse = true;
      const actionId = 'get';
      const action = getActionName(actionId, {
        resourceName
      });
      const actionFuncs = createActions(
        {
          ...defaultActions,
          [actionId]: {
            ...defaultActions[actionId],
            mergeResponse
          }
        },
        {
          resourceName,
          url
        }
      );
      const context = {id: 1};
      const body = {
        id: 1,
        firstName: 'John'
      };
      const code = 200;
      nock(host).get(`/users/${context.id}`).reply(code, body);
      const store = mockStore();
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
    it.only('should support context override', () => {
      const mergeResponse = true;
      const actionId = 'get';
      const action = getActionName(actionId, {
        resourceName
      });
      const actionFuncs = createActions(defaultActions, {
        resourceName,
        url
      });
      const context = {id: 1};
      const body = {
        id: 1,
        firstName: 'John'
      };
      const code = 200;
      nock(host).get(`/users/${context.id}`).reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store
        .dispatch(
          actionFuncs[action](context, {
            mergeResponse
          })
        )
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toMatchSnapshot();
        });
    });
  });
  describe('`invalidateState` option', () => {
    it('should support action override', () => {
      const invalidateState = true;
      const actionFuncs = createActions(
        {
          ...defaultActions,
          fetch: {
            ...defaultActions.fetch,
            invalidateState
          }
        },
        {
          resourceName,
          url
        }
      );
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      const body = [
        {
          id: 1,
          firstName: 'Olivier'
        }
      ];
      const code = 200;
      nock(host).get('/users').reply(code, body);
      const store = mockStore({
        users: {}
      });
      return store.dispatch(actionFuncs[action](context)).then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toMatchSnapshot();
      });
    });
  });
  describe('`beforeError` hook', () => {
    it('should support action override', () => {
      const beforeError = jest.fn((error) => {
        return error;
      });
      const actionFuncs = createActions(
        {
          ...defaultActions
        },
        {
          beforeError: [beforeError],
          resourceName,
          url
        }
      );
      const actionId = 'fetch';
      const action = getActionName(actionId, {
        resourceName,
        isArray: true
      });
      const context = {};
      nock(host).get('/users').replyWithError('something awful happened');
      const store = mockStore({
        users: {}
      });
      return expect(store.dispatch(actionFuncs[action](context)))
        .rejects.toBeDefined()
        .then(() => {
          const actions = store.getActions();
          actions[1].receivedAt = null;
          expect(actions).toMatchSnapshot();
          expect(beforeError.mock.calls.length).toBe(1);
        });
    });
  });
});
