import expect from 'expect';
import {combineReducers} from '../../src';
import {createTypes, getActionKey} from '../../src/types';
import {createReducers} from '../../src/reducers';
import {defaultActions, initialState} from '../../src/defaults';

// Configuration
const name = 'user';
initialState.name = name;

describe('createReducers', () => {
  it('should throw if name is undefined', () => {
    expect(() => {
      const reducers = createReducers();
      expect(typeof reducers).toBe('function');
    }).toThrow();
  });
  it('should return a reduce function', () => {
    const types = createTypes({name, actions: defaultActions});
    const reducers = createReducers({name, types});
    expect(typeof reducers).toBe('function');
  });
  it('should return the initial state', () => {
    const types = createTypes({name, actions: defaultActions});
    const reducers = createReducers({name, types});
    expect(reducers(undefined, {}))
      .toEqual(initialState);
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
  it('should handle GET with option `assignResponse`', () => {
    const actionKey = 'get';
    const actionOpts = {...defaultActions[actionKey], assignResponse: true};
    const customReducers = createReducers({name, actions: actionOpts, types});
    const type = types[getActionKey({name, actionKey, actionOpts})];
    const initialItems = [{id: 1, firstName: 'Olivier', lastName: 'Louvignes'}];
    const customInitialState = {...initialState, items: initialItems};
    const context = {id: 1};
    let status;

    status = 'pending';
    const pendingState = customReducers(customInitialState, {type, status, context});
    expect(pendingState)
      .toEqual({...customInitialState, isFetchingItem: true, didInvalidateItem: false});

    status = 'resolved';
    const body = {id: 1, firstName: 'Olivia', lastName: 'Louvignes'};
    const receivedAt = Date.now();
    const expectedItems = [body];
    expect(customReducers(pendingState, {type, status, context, options: actionOpts, body, receivedAt}))
      .toEqual({...pendingState, isFetchingItem: false, items: expectedItems, item: body, lastUpdatedItem: receivedAt});

    status = 'rejected';
    expect(customReducers(pendingState, {type, status, context, options: actionOpts, err: {}, receivedAt}))
      .toEqual({...pendingState, isFetchingItem: false});
  });
  it('should handle UPDATE action', () => {
    const actionKey = 'update';
    const actionOpts = defaultActions[actionKey];
    const type = types[getActionKey({name, actionKey, actionOpts})];
    const initialItems = [{id: 1, firstName: 'Olivier', lastName: 'Louvignes'}];
    const customInitialState = {...initialState, items: initialItems, item: initialItems[0]};
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
    const expectedItem = expectedItems[0];
    expect(reducers(pendingState, {type, status, context, body, receivedAt}))
      .toEqual({...customInitialState, isUpdating: false, items: expectedItems, item: expectedItem});

    status = 'rejected';
    expect(reducers(pendingState, {type, status, context, err: {}, receivedAt}))
      .toEqual({...customInitialState, isUpdating: false});
  });
  it('should handle UPDATE with option `assignResponse`', () => {
    const actionKey = 'update';
    const actionOpts = {...defaultActions[actionKey], assignResponse: true};
    const customReducers = createReducers({name, actions: actionOpts, types});
    const type = types[getActionKey({name, actionKey, actionOpts})];
    const initialItems = [{id: 1, firstName: 'Olivier', lastName: 'Louvignes'}];
    const customInitialState = {...initialState, items: initialItems};
    const context = {id: 1, firstName: 'Olivia'};
    let status;

    status = 'pending';
    const pendingState = customReducers(customInitialState, {type, status, context, options: actionOpts});
    expect(pendingState)
      .toEqual({...customInitialState, isUpdating: true});

    status = 'resolved';
    const body = {id: 1, firstName: 'Olivia2'};
    const receivedAt = Date.now();
    const expectedItems = [{id: 1, firstName: 'Olivia2', lastName: 'Louvignes'}];
    expect(customReducers(pendingState, {type, status, context, options: actionOpts, body, receivedAt}))
      .toEqual({...customInitialState, isUpdating: false, items: expectedItems});

    status = 'rejected';
    expect(customReducers(pendingState, {type, status, context, options: actionOpts, err: {}, receivedAt}))
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

describe('combineReducers', () => {
  it('should properly combine two reducer functions as a single object', () => {
    const fooTypes = createTypes({name: 'foo', actions: defaultActions});
    const fooReducers = createReducers({name: 'foo', fooTypes});
    const barTypes = createTypes({name: 'bar', actions: defaultActions});
    const barReducers = createReducers({name: 'bar', barTypes});
    const combinedReducers = combineReducers({foo: fooReducers, bar: barReducers});
    expect(typeof combinedReducers).toBe('function');
    expect(Object.keys(combinedReducers({}, {type: 'foo'}))).toEqual(['foo', 'bar']);
  });
  it('should properly combine two reducer functions as two objects', () => {
    const fooTypes = createTypes({name: 'foo', actions: defaultActions});
    const fooReducers = createReducers({name: 'foo', fooTypes});
    const barTypes = createTypes({name: 'bar', actions: defaultActions});
    const barReducers = createReducers({name: 'bar', barTypes});
    const combinedReducers = combineReducers({foo: fooReducers}, {bar: barReducers});
    expect(typeof combinedReducers).toBe('function');
    expect(Object.keys(combinedReducers({}, {type: 'foo'}))).toEqual(['foo', 'bar']);
  });
});
