import expect from 'expect';
// import {createStore, combineReducers} from '../src/index'
// import {addTodo, dispatchInMiddle, throwError, unknownAction} from './helpers/actionCreators'
// import * as reducers from './helpers/reducers'

// import {createResource} from '../src';
import {createTypes, getActionKey, getActionType} from '../src/types';
import {defaultActions} from '../src/defaults';
import {values} from 'lodash';
try { require('debug-utils'); } catch (err) {}; // eslint-disable-line

describe('createTypes', () => {
  it('should throw if name is undefined', () => {
    expect(() => {
      const types = createTypes();
      expect(types).toBeA('object');
    }).toThrow();
  });
  it('should properly return an object with properly named keys', () => {
    const name = 'user';
    const types = createTypes({name});
    const expectedKeys = Object.keys(defaultActions).map(actionKey => getActionKey({actionKey}));
    expect(Object.keys(types)).toEqual(expectedKeys);
    const expectedValuesFn = action => expect(action).toBeA('string');
    values(types).forEach(expectedValuesFn);
    const expectedValues = Object.keys(defaultActions).map(actionKey => getActionType({name, actionKey}));
    expect(values(types)).toEqual(expectedValues);
  });
});
