import expect from 'expect';
import {values} from 'lodash';
import {createTypes} from '../../src/types';
import {defaultActions} from '../../src/defaults';

describe('createTypes', () => {
  describe('when using a resource', () => {
    it('should properly return an object with properly named keys', () => {
      const resourceName = 'user';
      const types = createTypes(defaultActions, {resourceName});
      const expectedKeys = ['CREATE_USER', 'FETCH_USERS', 'GET_USER', 'UPDATE_USER', 'DELETE_USER'];
      expect(Object.keys(types)).toEqual(expectedKeys);
      const expectedValues = ['@@resource/USER/CREATE', '@@resource/USER/FETCH', '@@resource/USER/GET', '@@resource/USER/UPDATE', '@@resource/USER/DELETE'];
      expect(values(types)).toEqual(expectedValues);
    });
  });
  describe('when not using a resource', () => {
    it('should properly return an object with properly named keys', () => {
      const types = createTypes(defaultActions, {});
      const expectedKeys = ['CREATE', 'FETCH', 'GET', 'UPDATE', 'DELETE'];
      expect(Object.keys(types)).toEqual(expectedKeys);
      const expectedValues = ['CREATE', 'FETCH', 'GET', 'UPDATE', 'DELETE'];
      expect(values(types)).toEqual(expectedValues);
    });
  });
  describe('when using a falsy scope', () => {
    it('should properly return an object with properly named keys', () => {
      const types = createTypes(defaultActions, {scope: false});
      const expectedKeys = ['CREATE', 'FETCH', 'GET', 'UPDATE', 'DELETE'];
      expect(Object.keys(types)).toEqual(expectedKeys);
      const expectedValues = ['CREATE', 'FETCH', 'GET', 'UPDATE', 'DELETE'];
      expect(values(types)).toEqual(expectedValues);
    });
  });
  describe('when using a custom scope', () => {
    it('should properly return an object with properly named keys', () => {
      const types = createTypes(defaultActions, {scope: '@@custom/TEAM'});
      const expectedKeys = ['CREATE', 'FETCH', 'GET', 'UPDATE', 'DELETE'];
      expect(Object.keys(types)).toEqual(expectedKeys);
      const expectedValues = ['@@custom/TEAM/CREATE', '@@custom/TEAM/FETCH', '@@custom/TEAM/GET', '@@custom/TEAM/UPDATE', '@@custom/TEAM/DELETE'];
      expect(values(types)).toEqual(expectedValues);
    });
  });
  describe('when using custom actions', () => {
    it('should properly return an object with properly named keys', () => {
      const resourceName = 'team';
      const customActions = {promote: {method: 'POST'}, merge: {method: 'POST', isArray: true}};
      const types = createTypes(customActions, {resourceName});
      const expectedKeys = ['PROMOTE_TEAM', 'MERGE_TEAMS'];
      expect(Object.keys(types)).toEqual(expectedKeys);
      const expectedValues = ['@@resource/TEAM/PROMOTE', '@@resource/TEAM/MERGE'];
      expect(values(types)).toEqual(expectedValues);
    });
  });
});
