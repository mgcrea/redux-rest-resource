import expect from 'expect';
import {values} from 'lodash';

import {defaultActions, initialState} from '../../src/defaults';
import {createTypes, getActionTypeKey} from '../../src/types';
import {createRootReducer, createReducers} from '../../src/reducers';
import {combineReducers} from '../../src/reducers/helpers';

// Configuration
const resourceName = 'user';

describe('createReducers', () => {
  it('should return a reduce function', () => {
    const reducers = createReducers(defaultActions, {resourceName});
    expect(typeof reducers).toBe('object');
    const expectedValuesFn = reducer => expect(typeof reducer).toBe('function');
    values(reducers).forEach(expectedValuesFn);
  });
  it('should return a reduce function', () => {
    const rootReducer = createRootReducer(defaultActions, {resourceName});
    expect(typeof rootReducer).toBe('function');
  });
  it('should return the initial state', () => {
    const rootReducer = createRootReducer(defaultActions, {resourceName});
    expect(rootReducer(undefined, {}))
      .toEqual(initialState);
  });
});

describe('defaultReducers', () => {
  const types = createTypes(defaultActions, {resourceName});
  const reducers = createReducers(defaultActions, {resourceName});
  it('should handle CREATE action', () => {
    const actionId = 'create';
    const type = types[getActionTypeKey(actionId, {resourceName})];
    const context = {firstName: 'Olivier'};
    let status;

    status = 'pending';
    const pendingAction = {type, status, context};
    const pendingState = reducers[actionId](undefined, pendingAction);
    expect(pendingState)
      .toEqual({isCreating: true});

    status = 'resolved';
    const body = {id: 1, firstName: 'Olivier'};
    const receivedAt = Date.now();
    const resolvedAction = {type, status, context, body, receivedAt};
    expect(reducers[actionId](pendingState, resolvedAction))
      .toEqual({isCreating: false, items: [body]});

    status = 'rejected';
    const rejectedAction = {type, status, context, err: {}, receivedAt};
    expect(reducers[actionId](pendingState, rejectedAction))
      .toEqual({isCreating: false});
  });
  it('should handle FETCH action', () => {
    const actionId = 'fetch';
    const type = types[getActionTypeKey(actionId, {resourceName})];
    let status;

    status = 'pending';
    const pendingState = reducers[actionId](undefined, {type, status});
    expect(pendingState)
      .toEqual({isFetching: true, didInvalidate: false});

    status = 'resolved';
    const body = [{id: 1, firstName: 'Olivier'}];
    const receivedAt = Date.now();
    expect(reducers[actionId](pendingState, {type, status, body, receivedAt}))
      .toEqual({isFetching: false, didInvalidate: false, items: body, lastUpdated: receivedAt});

    status = 'rejected';
    expect(reducers[actionId](pendingState, {type, status, err: {}, receivedAt}))
      .toEqual({didInvalidate: false, isFetching: false});
  });
  it('should handle GET action', () => {
    const actionId = 'get';
    const type = types[getActionTypeKey(actionId, {resourceName})];
    const context = {id: 1};
    let status;

    status = 'pending';
    const pendingState = reducers[actionId](undefined, {type, status, context});
    expect(pendingState)
      .toEqual({isFetchingItem: true, didInvalidateItem: false});

    status = 'resolved';
    const body = [{id: 1, firstName: 'Olivier'}];
    const receivedAt = Date.now();
    expect(reducers[actionId](pendingState, {type, status, context, body, receivedAt}))
      .toEqual({isFetchingItem: false, didInvalidateItem: false, item: body, lastUpdatedItem: receivedAt});

    status = 'rejected';
    expect(reducers[actionId](pendingState, {type, status, context, err: {}, receivedAt}))
      .toEqual({isFetchingItem: false, didInvalidateItem: false});
  });
  it('should handle UPDATE action', () => {
    const actionId = 'update';
    const type = types[getActionTypeKey(actionId, {resourceName})];
    const initialItems = [{id: 1, firstName: 'Olivier', lastName: 'Louvignes'}];
    const customInitialState = {items: initialItems, item: initialItems[0]};
    const context = {id: 1, firstName: 'Olivia'};
    let status;

    status = 'pending';
    const pendingState = reducers[actionId](customInitialState, {type, status, context});
    expect(pendingState)
      .toEqual({...customInitialState, isUpdating: true});

    status = 'resolved';
    const body = {ok: true};
    const receivedAt = Date.now();
    const expectedItems = [{id: 1, firstName: 'Olivia', lastName: 'Louvignes'}];
    const expectedItem = expectedItems[0];
    expect(reducers[actionId](pendingState, {type, status, context, body, receivedAt}))
      .toEqual({isUpdating: false, items: expectedItems, item: expectedItem});

    status = 'rejected';
    expect(reducers[actionId](pendingState, {type, status, context, err: {}, receivedAt}))
      .toEqual({...customInitialState, isUpdating: false});
  });
  it('should handle DELETE action', () => {
    const actionId = 'delete';
    const type = types[getActionTypeKey(actionId, {resourceName})];
    const initialItems = [{id: 1, firstName: 'Olivier', lastName: 'Louvignes'}];
    const customInitialState = {items: initialItems};
    const context = {id: 1};
    let status;

    status = 'pending';
    const pendingState = reducers[actionId](customInitialState, {type, status, context});
    expect(pendingState)
      .toEqual({...customInitialState, isDeleting: true});

    status = 'resolved';
    const body = {ok: true};
    const receivedAt = Date.now();
    const expectedItems = [];
    expect(reducers[actionId](pendingState, {type, status, context, body, receivedAt}))
      .toEqual({isDeleting: false, items: expectedItems});

    status = 'rejected';
    expect(reducers[actionId](pendingState, {type, status, context, err: {}, receivedAt}))
      .toEqual({...customInitialState, isDeleting: false});
  });
});

describe('custom reducers', () => {
  const customActions = {run: {method: 'POST', gerundName: 'running'}, merge: {method: 'POST', isArray: true}};
  const types = createTypes(customActions, {resourceName});
  const reducers = createReducers(customActions, {resourceName});
  it('should handle RUN action', () => {
    const actionId = 'run';
    const type = types[getActionTypeKey(actionId, {resourceName})];
    const context = {firstName: 'Olivier'};
    let status;

    status = 'pending';
    const pendingAction = {type, status, context};
    const pendingState = reducers[actionId](undefined, pendingAction);
    expect(pendingState)
      .toEqual({isRunning: true});

    status = 'resolved';
    const body = {ok: 1};
    const receivedAt = Date.now();
    const resolvedAction = {type, status, context, body, receivedAt};
    expect(reducers[actionId](pendingState, resolvedAction))
      .toEqual({isRunning: false});

    status = 'rejected';
    const rejectedAction = {type, status, context, err: {}, receivedAt};
    expect(reducers[actionId](pendingState, rejectedAction))
      .toEqual({isRunning: false});
  });
  it('should handle FETCH action', () => {
    const actionId = 'merge';
    const type = types[getActionTypeKey(actionId, {resourceName})];
    let status;

    status = 'pending';
    const pendingState = reducers[actionId](undefined, {type, status});
    expect(pendingState)
      .toEqual({isMerging: true});

    status = 'resolved';
    const body = [{id: 1, firstName: 'Olivier'}];
    const receivedAt = Date.now();
    expect(reducers[actionId](pendingState, {type, status, body, receivedAt}))
      .toEqual({isMerging: false});

    status = 'rejected';
    expect(reducers[actionId](pendingState, {type, status, err: {}, receivedAt}))
      .toEqual({isMerging: false});
  });
});

describe('custom pure reducers', () => {
  const customActions = {
    clear: {
      isPure: true,
      reduce: (state, action) => ({...state, item: null})
    }
  };
  const types = createTypes(customActions, {resourceName});
  const reducers = createReducers(customActions, {resourceName});
  it('should handle CLEAR action', () => {
    const actionId = 'clear';
    const type = types[getActionTypeKey(actionId, {resourceName})];
    const context = {firstName: 'Olivier'};
    let status;

    const body = {ok: 1};
    const receivedAt = Date.now();
    const resolvedAction = {type, status, context, body, receivedAt};
    expect(reducers[actionId](undefined, resolvedAction))
      .toEqual({item: null});
  });
});

describe('reducer options', () => {
  const types = createTypes(defaultActions, {resourceName});
  describe('`assignResponse` option', () => {
    it('should handle GET action', () => {
      const actionId = 'get';
      const assignResponse = true;
      const reducers = createReducers({...defaultActions, [actionId]: {...defaultActions[actionId], assignResponse}}, {resourceName});
      const type = types[getActionTypeKey(actionId, {resourceName})];

      const initialItems = [{id: 1, firstName: 'Olivier', lastName: 'Louvignes'}];
      const customInitialState = {items: initialItems};
      const context = {id: 1};
      const options = {assignResponse};
      let status;

      status = 'pending';
      const pendingState = reducers[actionId](customInitialState, {type, status, context});
      expect(pendingState)
        .toEqual({...customInitialState, isFetchingItem: true, didInvalidateItem: false});

      status = 'resolved';
      const body = {id: 1, firstName: 'Olivia', lastName: 'Louvignes'};
      const receivedAt = Date.now();
      const expectedItems = [body];
      expect(reducers[actionId](pendingState, {type, status, context, options, body, receivedAt}))
        .toEqual({isFetchingItem: false, didInvalidateItem: false, items: expectedItems, item: body, lastUpdatedItem: receivedAt});

      status = 'rejected';
      expect(reducers[actionId](pendingState, {type, status, context, options, err: {}, receivedAt}))
        .toEqual({...customInitialState, didInvalidateItem: false, isFetchingItem: false});
    });
    it('should handle UPDATE action', () => {
      const actionId = 'update';
      const assignResponse = true;
      const reducers = createReducers({...defaultActions, [actionId]: {...defaultActions[actionId], assignResponse}}, {resourceName});
      const type = types[getActionTypeKey(actionId, {resourceName})];

      const initialItems = [{id: 1, firstName: 'Olivier', lastName: 'Louvignes'}];
      const customInitialState = {...initialState, items: initialItems};
      const context = {id: 1, firstName: 'Olivia'};
      const options = {assignResponse};
      let status;

      status = 'pending';
      const pendingState = reducers[actionId](customInitialState, {type, status, context, options});
      expect(pendingState)
        .toEqual({...customInitialState, isUpdating: true});

      status = 'resolved';
      const body = {id: 1, firstName: 'Olivia2'};
      const receivedAt = Date.now();
      const expectedItems = [{id: 1, firstName: 'Olivia2', lastName: 'Louvignes'}];
      expect(reducers[actionId](pendingState, {type, status, context, options, body, receivedAt}))
        .toEqual({...customInitialState, isUpdating: false, items: expectedItems});

      status = 'rejected';
      expect(reducers[actionId](pendingState, {type, status, context, options, err: {}, receivedAt}))
        .toEqual({...customInitialState, isUpdating: false});
    });
  });
});

describe('rootReducer', () => {
  it('should handle a default action', () => {
    const types = createTypes(defaultActions, {resourceName});
    const rootReducer = createRootReducer(defaultActions, {resourceName});
    const actionId = 'create';
    const type = types[getActionTypeKey(actionId, {resourceName})];
    const context = {firstName: 'Olivier'};
    let status;

    status = 'pending';
    const pendingAction = {type, status, context};
    const pendingState = rootReducer(undefined, pendingAction);
    expect(pendingState)
      .toEqual({...initialState, isCreating: true});

    status = 'resolved';
    const body = {id: 1, firstName: 'Olivier'};
    const receivedAt = Date.now();
    const resolvedAction = {type, status, context, body, receivedAt};
    expect(rootReducer(pendingState, resolvedAction))
      .toEqual({...initialState, isCreating: false, items: [body]});

    status = 'rejected';
    const rejectedAction = {type, status, context, err: {}, receivedAt};
    expect(rootReducer(pendingState, rejectedAction))
      .toEqual({...initialState, isCreating: false});
  });
  it('should handle a custom action', () => {
    const customActions = {run: {method: 'POST', gerundName: 'running'}, merge: {method: 'POST', isArray: true}};
    const types = createTypes(customActions, {resourceName});
    const rootReducer = createRootReducer(customActions, {resourceName});
    const actionId = 'run';
    const type = types[getActionTypeKey(actionId, {resourceName})];
    const context = {firstName: 'Olivier'};
    let status;

    status = 'pending';
    const pendingAction = {type, status, context};
    const pendingState = rootReducer(undefined, pendingAction);
    expect(pendingState)
      .toEqual({...initialState, isRunning: true});

    status = 'resolved';
    const body = {id: 1, firstName: 'Olivier'};
    const receivedAt = Date.now();
    const resolvedAction = {type, status, context, body, receivedAt};
    expect(rootReducer(pendingState, resolvedAction))
      .toEqual({...initialState, isRunning: false});

    status = 'rejected';
    const rejectedAction = {type, status, context, err: {}, receivedAt};
    expect(rootReducer(pendingState, rejectedAction))
      .toEqual({...initialState, isRunning: false});
  });
  describe('should handle a pure action', () => {
    const customActions = {
      mockAll: {
        isPure: true,
        isArray: true,
        reduce: (state, action) => ({...state, items: [{foo: 'bar'}]})
      }
    };
    const types = createTypes(customActions, {resourceName});
    const rootReducer = createRootReducer(customActions, {resourceName});
    const actionId = 'mockAll';
    const type = types[getActionTypeKey(actionId, {resourceName, isArray: true})];
    const context = {firstName: 'Olivier'};

    const status = 'resolved';
    const receivedAt = Date.now();
    const resolvedAction = {type, status, context, receivedAt};
    expect(rootReducer(initialState, resolvedAction))
      .toEqual({...initialState, items: [{foo: 'bar'}]});
  });
});

describe('helpers', () => {
  describe('combineReducers', () => {
    it('should properly combine two reducer functions as a single object', () => {
      const fooReducers = createRootReducer(defaultActions, {resourceName: 'foo'});
      const barReducers = createRootReducer(defaultActions, {resourceName: 'bar'});
      const combinedReducers = combineReducers({foo: fooReducers, bar: barReducers});
      expect(typeof combinedReducers).toBe('function');
      expect(Object.keys(combinedReducers({}, {type: 'foo'}))).toEqual(['foo', 'bar']);
    });
    it('should properly combine two reducer functions as two objects', () => {
      const fooReducers = createRootReducer({resourceName: 'foo'});
      const barReducers = createRootReducer({resourceName: 'bar'});
      const combinedReducers = combineReducers({foo: fooReducers}, {bar: barReducers});
      expect(typeof combinedReducers).toBe('function');
      expect(Object.keys(combinedReducers({}, {type: 'foo'}))).toEqual(['foo', 'bar']);
    });
  });
});
