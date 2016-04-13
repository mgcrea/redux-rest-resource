import expect, {createSpy, spyOn, isSpy} from 'expect'
import nock from 'nock'
// import {createStore, combineReducers} from '../src/index'
// import {addTodo, dispatchInMiddle, throwError, unknownAction} from './helpers/actionCreators'
// import * as reducers from './helpers/reducers'

// import {createResource} from '../src';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

import {getActionType} from '../src/types';
import {createActions, getActionName} from '../src/actions';
import {defaultActions} from '../src/defaults';
import {values} from 'lodash';
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
    const actionFuncs = createActions({name, url});
    const expectedKeys = Object.keys(defaultActions).map(actionKey => getActionName({name, actionKey, actionOpts: defaultActions[actionKey]}));
    expect(Object.keys(actionFuncs)).toEqual(expectedKeys);
  });
  it('should return an object with properly typed values', () => {
    const actionFuncs = createActions({name, url});
    const expectedValuesFn = action => expect(action).toBeA('function');
    values(actionFuncs).forEach(expectedValuesFn);
  });
});

describe('createActions', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  const actionFuncs = createActions({name, url});
  it('.create()', (done) => {
    const actionKey = 'create';
    const action = getActionName({name, actionKey});
    const type = getActionType({name, actionKey});
    const context = {firstName: 'Olivier'};
    const body = {ok: true};
    nock(host)
      .post('/users', context)
      .reply(200, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'resolved', type, context, body, receivedAt: null}
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
    nock(host)
      .get('/users')
      .reply(200, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'resolved', type, context, body, receivedAt: null}
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
    nock(host)
      .get(`/users/${context.id}`)
      .reply(200, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'resolved', type, context, body, receivedAt: null}
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
    nock(host)
      .patch(`/users/${context.id}`, context)
      .reply(200, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'resolved', type, context, body, receivedAt: null}
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
    nock(host)
      .delete(`/users/${context.id}`)
      .reply(200, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context},
      {status: 'resolved', type, context, body, receivedAt: null}
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
