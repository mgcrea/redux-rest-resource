import expect from 'expect';
import {values} from 'lodash';
import {createTypes, getActionKey, getActionType} from '../../src/types';
import {defaultActions} from '../../src/defaults';

try { require('debug-utils'); } catch (err) {}; // eslint-disable-line

describe('createTypes', () => {
  it('should throw if name is undefined', () => {
    expect(() => {
      const types = createTypes();
      expect(typeof types).toBe('object');
    }).toThrow();
  });
  it('should properly return an object with properly named keys', () => {
    const name = 'user';
    const types = createTypes({name, actions: defaultActions});
    const expectedKeys = Object.keys(defaultActions).map(actionKey =>
      getActionKey({name, actionKey, actionOpts: defaultActions[actionKey]}));
    expect(Object.keys(types)).toEqual(expectedKeys);
    const expectedValuesFn = action => expect(typeof action).toBe('string');
    values(types).forEach(expectedValuesFn);
    const expectedValues = Object.keys(defaultActions).map(actionKey => getActionType({name, actionKey}));
    expect(values(types)).toEqual(expectedValues);
  });
});
