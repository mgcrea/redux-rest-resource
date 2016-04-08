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
require('debug-utils');

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
  it('.fetch()', (done) => {
    const actionKey = 'fetch';
    const type = getActionType({name, actionKey});
    const body = [{id: 1, firstName: 'Olivier'}];
    nock(host)
      .get('/users')
      .reply(200, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type},
      {status: 'resolved', type, body, receivedAt: null}
    ];
    store.dispatch(actionFuncs.fetchUsers())
      .then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toEqual(expectedActions);
      })
      .then(done)
      .catch(done);
  });
  it.only('.get()', (done) => {
    const actionKey = 'get';
    const type = getActionType({name, actionKey});
    const body = {id: 1, firstName: 'Olivier'};
    nock(host)
      .get(`/users/${body.id}`)
      .reply(200, body);
    const store = mockStore({users: {}});
    const expectedActions = [
      {status: 'pending', type, context: body.id},
      {status: 'resolved', type, body, receivedAt: null}
    ];
    store.dispatch(actionFuncs.getUser(body.id))
      .then(() => {
        const actions = store.getActions();
        actions[1].receivedAt = null;
        expect(actions).toEqual(expectedActions);
      })
      .then(done)
      .catch(done);
  });
});
