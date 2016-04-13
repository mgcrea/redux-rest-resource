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
    const types = createTypes({name});
    const reducers = createReducers({types});
    expect(reducers).toBeA('function');
  });
  it('should return the initial state', () => {
    const types = createTypes({name});
    const reducers = createReducers({types});
    expect(reducers(undefined, {})).
      toEqual(initialState);
  });
});

describe('createReducers', () => {
  const types = createTypes({name, url});
  const reducers = createReducers({types});
  it('should handle CREATE action', () => {
    const actionKey = 'create';
    const type = types[getActionKey({actionKey})];
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
    const type = types[getActionKey({actionKey})];
    let status;

    status = 'pending';
    const pendingState = reducers(undefined, {type, status});
    expect(pendingState)
      .toEqual({...initialState, isFetching: true, didInvalidate: false});

    status = 'resolved';
    const body = [{id: 1, firstName: 'Olivier'}];
    const receivedAt = Date.now();
    expect(reducers(pendingState, {type, status, body, receivedAt}))
      .toEqual({...initialState, didInvalidate: false, items: body, lastUpdated: receivedAt});

    status = 'rejected';
    expect(reducers(pendingState, {type, status, err: {}, receivedAt}))
      .toEqual({...initialState, didInvalidate: false});
  });
  it('should handle GET action', () => {
    const actionKey = 'get';
    const type = types[getActionKey({actionKey})];
    const context = {id: 1};
    let status;

    status = 'pending';
    const pendingState = reducers(undefined, {type, status, context});
    expect(pendingState)
      .toEqual({...initialState, isFetchingItem: true});

    status = 'resolved';
    const body = [{id: 1, firstName: 'Olivier'}];
    const receivedAt = Date.now();
    expect(reducers(pendingState, {type, status, context, body, receivedAt}))
      .toEqual({...initialState, isFetchingItem: false, item: body});

    status = 'rejected';
    expect(reducers(pendingState, {type, status, context, err: {}, receivedAt}))
      .toEqual({...initialState, isFetchingItem: false});
  });
  it('should handle UPDATE action', () => {
    const actionKey = 'update';
    const type = types[getActionKey({actionKey})];
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
    const type = types[getActionKey({actionKey})];
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
