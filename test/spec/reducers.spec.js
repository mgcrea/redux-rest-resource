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

import {createTypes, getActionKey, getActionType} from '../../src/types';
import {createReducers, initialState} from '../../src/reducers';
import {defaultActions} from '../../src/defaults';
import {values} from 'lodash';
try { require('debug-utils'); } catch (err) {}; // eslint-disable-line

// Configuration
const name = 'user';
initialState.name = name;
const host = 'http://localhost:3000';
const url = `${host}/users/:id`;

describe('createReducers', () => {
  it('should throw if name is undefined', () => {
    expect(() => {
      const reducers = createReducers();
      expect(reducers).toBeA('function');
    }).toThrow();
  });
  it('should return a reduce function', () => {
    const types = createTypes({name, actions: defaultActions});
    const reducers = createReducers({name, types});
    expect(reducers).toBeA('function');
  });
  it('should return the initial state', () => {
    const types = createTypes({name, actions: defaultActions});
    const reducers = createReducers({name, types});
    expect(reducers(undefined, {})).
      toEqual(initialState);
  });
});

describe('createReducers', () => {
  const types = createTypes({name, actions: defaultActions});
  const reducers = createReducers({name, types});
  it('should handle CREATE action', () => {
    const actionKey = 'create';
    const actionOpts = defaultActions[actionKey];
    const type = types[getActionKey({name, actionKey, actionOpts})];
    const context = {firstName: 'Olivier'};
    let status;

    status = 'pending';
    const pendingState = reducers(undefined, {type, status, context});
    expect(pendingState)
      .toEqual({...initialState, isCreating: true});

    status = 'resolved';
    const body = {id: 1, firstName: 'Olivier'};
    const receivedAt = Date.now();
    expect(reducers(pendingState, {type, status, context, body, receivedAt}))
      .toEqual({...initialState, isCreating: false, items: initialState.items.concat(body)});

    status = 'rejected';
    expect(reducers(pendingState, {type, status, context, err: {}, receivedAt}))
      .toEqual({...initialState, isCreating: false});
  });
  it('should handle FETCH action', () => {
    const actionKey = 'fetch';
    const actionOpts = defaultActions[actionKey];
    const type = types[getActionKey({name, actionKey, actionOpts})];
    let status;

    status = 'pending';
    const pendingState = reducers(undefined, {type, status});
    expect(pendingState)
      .toEqual({...initialState, isFetching: true, didInvalidate: false});

    status = 'resolved';
    const body = [{id: 1, firstName: 'Olivier'}];
    const receivedAt = Date.now();
    expect(reducers(pendingState, {type, status, body, receivedAt}))
      .toEqual({...pendingState, isFetching: false, items: body, lastUpdated: receivedAt});

    status = 'rejected';
    expect(reducers(pendingState, {type, status, err: {}, receivedAt}))
      .toEqual({...pendingState, isFetching: false});
  });
  it('should handle GET action', () => {
    const actionKey = 'get';
    const actionOpts = defaultActions[actionKey];
    const type = types[getActionKey({name, actionKey, actionOpts})];
    const context = {id: 1};
    let status;

    status = 'pending';
    const pendingState = reducers(undefined, {type, status, context});
    expect(pendingState)
      .toEqual({...initialState, isFetchingItem: true, didInvalidateItem: false});

    status = 'resolved';
    const body = [{id: 1, firstName: 'Olivier'}];
    const receivedAt = Date.now();
    expect(reducers(pendingState, {type, status, context, body, receivedAt}))
      .toEqual({...pendingState, isFetchingItem: false, item: body, lastUpdatedItem: receivedAt});

    status = 'rejected';
    expect(reducers(pendingState, {type, status, context, err: {}, receivedAt}))
      .toEqual({...pendingState, isFetchingItem: false});
  });
  it('should handle UPDATE action', () => {
    const actionKey = 'update';
    const actionOpts = defaultActions[actionKey];
    const type = types[getActionKey({name, actionKey, actionOpts})];
    const initialItems = [{id: 1, firstName: 'Olivier', lastName: 'Louvignes'}];
    const customInitialState = {...initialState, items: initialItems};
    const context = {id: 1, firstName: 'Olivia'};
    let status;

    status = 'pending';
    const pendingState = reducers(customInitialState, {type, status, context});
    expect(pendingState)
      .toEqual({...customInitialState, isUpdating: true});

    status = 'resolved';
    const body = {ok: true};
    const receivedAt = Date.now();
    const expectedItems = [{id: 1, firstName: 'Olivia', lastName: 'Louvignes'}];
    expect(reducers(pendingState, {type, status, context, body, receivedAt}))
      .toEqual({...customInitialState, isUpdating: false, items: expectedItems});

    status = 'rejected';
    expect(reducers(pendingState, {type, status, context, err: {}, receivedAt}))
      .toEqual({...customInitialState, isUpdating: false});
  });
  it('should handle DELETE action', () => {
    const actionKey = 'delete';
    const actionOpts = defaultActions[actionKey];
    const type = types[getActionKey({name, actionKey, actionOpts})];
    const initialItems = [{id: 1, firstName: 'Olivier', lastName: 'Louvignes'}];
    const customInitialState = {...initialState, items: initialItems};
    const context = {id: 1};
    let status;

    status = 'pending';
    const pendingState = reducers(customInitialState, {type, status, context});
    expect(pendingState)
      .toEqual({...customInitialState, isDeleting: true});

    status = 'resolved';
    const body = {ok: true};
    const receivedAt = Date.now();
    const expectedItems = [];
    expect(reducers(pendingState, {type, status, context, body, receivedAt}))
      .toEqual({...customInitialState, isDeleting: false, items: expectedItems});

    status = 'rejected';
    expect(reducers(pendingState, {type, status, context, err: {}, receivedAt}))
      .toEqual({...customInitialState, isDeleting: false});
  });
});
