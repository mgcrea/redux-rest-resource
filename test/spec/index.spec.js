import expect from 'expect';
import {createResource} from '../../src';

// Configuration
const name = 'user';
const host = 'http://localhost:3000';
const url = `${host}/users/:id`;

describe('createResource', () => {
  it('should throw if name is undefined', () => {
    expect(() => {
      const resource = createResource();
      expect(resource).toBeA('object');
    }).toThrow();
  });
  it('should properly return an object with properly named keys', () => {
    const {types, actions, reducers} = createResource({name, url});
    expect(types).toBeA('object');
    expect(actions).toBeA('object');
    expect(reducers).toBeA('function');
  });
  it('should properly merge action opts', () => {
    const {types, actions, reducers} = createResource({name, url, actions: {get: {foo: 'bar'}, charge: {method: 'post'}}});
    expect(types).toBeA('object');
    expect(Object.keys(types).length).toEqual(6);
    expect(actions).toBeA('object');
    expect(Object.keys(actions).length).toEqual(6);
    expect(reducers).toBeA('function');
  });
  it('should properly pick action opts', () => {
    const {types, actions, reducers} = createResource({name, url, pick: ['fetch']});
    expect(types).toBeA('object');
    expect(Object.keys(types).length).toEqual(1);
    expect(actions).toBeA('object');
    expect(Object.keys(actions).length).toEqual(1);
    expect(reducers).toBeA('function');
  });
});
