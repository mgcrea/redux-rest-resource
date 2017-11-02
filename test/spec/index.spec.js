import expect from 'expect';
import {createResource, fetch} from '../../src';

// Configuration
const name = 'user';
const host = 'http://localhost:3000';
const url = `${host}/users/:id`;

describe('lib', () => {
  it('should properly export fetch', () => {
    expect(typeof fetch).toBe('function');
  });
});

describe('createResource', () => {
  it('should properly return an object with properly named keys', () => {
    const {types, actions, reducers} = createResource({name, url});
    expect(typeof types).toBe('object');
    expect(typeof actions).toBe('object');
    expect(typeof reducers).toBe('function');
  });
  it('should properly merge action opts', () => {
    const {types, actions, reducers} = createResource({name, url, actions: {get: {foo: 'bar'}, charge: {method: 'post'}}});
    expect(typeof types).toBe('object');
    expect(Object.keys(types).length).toEqual(6);
    expect(typeof actions).toBe('object');
    expect(Object.keys(actions).length).toEqual(6);
    expect(typeof reducers).toBe('function');
  });
});

describe('resourceOptions', () => {
  describe('`pick` option', () => {
    it('should properly pick action', () => {
      const {types, actions, reducers} = createResource({name, url, pick: ['fetch']});
      expect(typeof types).toBe('object');
      expect(Object.keys(types).length).toEqual(1);
      expect(typeof actions).toBe('object');
      expect(Object.keys(actions).length).toEqual(1);
      expect(typeof reducers).toBe('function');
    });
  });
  describe('`mergeDefaultActions` option', () => {
    it('should properly not merge defaultActions', () => {
      const {types, actions, reducers} = createResource({name, url, actions: {charge: {method: 'post'}}, mergeDefaultActions: false});
      expect(typeof types).toBe('object');
      expect(Object.keys(types).length).toEqual(1);
      expect(typeof actions).toBe('object');
      expect(Object.keys(actions).length).toEqual(1);
      expect(typeof reducers).toBe('function');
    });
  });
});
