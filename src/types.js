import {mapObject, getPluralName, upperSnakeCase} from './helpers/util';

const scopeType = (type, scope) => (scope ? `${scope}/${type}` : type);

const scopeTypes = (types = {}, scope) => (scope ? mapObject(types, type => scopeType(type, scope)) : types);

const getTypesScope = resourceName => (
  resourceName
    ? `@@resource/${upperSnakeCase(resourceName)}`
    : ''
);

const getActionTypeKey = (actionId, {resourceName, resourcePluralName = getPluralName(resourceName), isArray = false} = {}) => (
  resourceName
    ? `${actionId.toUpperCase()}_${upperSnakeCase(isArray ? resourcePluralName : resourceName)}`
    : upperSnakeCase(actionId)
);

const getActionType = actionId => (
  upperSnakeCase(actionId)
);

const createType = (actionId, {resourceName, resourcePluralName, isArray = false}) => {
  const typeKey = getActionTypeKey(actionId, {resourceName, resourcePluralName, isArray});
  return {[typeKey]: getActionType(actionId)};
};

const createTypes = (actions = {}, {resourceName, resourcePluralName, scope = getTypesScope(resourceName)} = {}) => {
  const rawTypes = Object.keys(actions).reduce((types, actionId) => {
    const actionOpts = actions[actionId];
    return Object.assign(types, createType(actionId, {resourceName, resourcePluralName, isArray: actionOpts.isArray}));
  }, {});
  return scopeTypes(rawTypes, scope);
};

export {scopeType, getTypesScope, createType, createTypes, getActionType, getActionTypeKey};
