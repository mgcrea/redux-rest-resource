import {getPluralName, mapObject, upperSnakeCase} from './helpers/util';
import {ActionsOptions, Types} from './typings';

const scopeType = (type: string, scope?: string): string => (scope ? `${scope}/${type}` : type);

const scopeTypes = (types: Types = {}, scope: string): Types =>
  scope ? mapObject(types, (type) => scopeType(type, scope)) : types;

const getTypesScope = (resourceName: string): string =>
  resourceName ? `@@resource/${upperSnakeCase(resourceName)}` : '';

type GetActionTypeKeyOptions = {
  resourceName: string;
  resourcePluralName: string;
  isArray: boolean;
};

const getActionTypeKey = (
  actionId: string,
  {resourceName, resourcePluralName = getPluralName(resourceName), isArray = false}: GetActionTypeKeyOptions
): string =>
  resourceName
    ? `${actionId.toUpperCase()}_${upperSnakeCase(isArray ? resourcePluralName : resourceName)}`
    : upperSnakeCase(actionId);

const getActionType = (actionId: string): string => upperSnakeCase(actionId);

type CreateTypeOptions = {
  resourceName: string;
  resourcePluralName: string;
  isArray?: boolean;
  alias?: string;
};

const createType = (
  actionId: string,
  {resourceName, resourcePluralName, isArray = false, alias}: CreateTypeOptions
): Types => {
  const typeKey = getActionTypeKey(resourceName ? alias || actionId : actionId, {
    resourceName,
    resourcePluralName,
    isArray
  });
  return {
    [typeKey]: getActionType(actionId)
  };
};

type CreateTypesOptions = {
  resourceName: string;
  resourcePluralName: string;
  scope?: string;
};

const createTypes = (
  actions: ActionsOptions = {},
  {resourceName, resourcePluralName, scope = getTypesScope(resourceName)}: CreateTypesOptions
): Types => {
  const rawTypes = Object.keys(actions).reduce((types, actionId) => {
    const actionOpts = actions[actionId];
    return Object.assign(
      types,
      createType(actionId, {
        resourceName,
        resourcePluralName,
        isArray: actionOpts.isArray,
        alias: actionOpts.alias
      })
    );
  }, {});
  return scopeTypes(rawTypes, scope);
};

export {scopeType, scopeTypes, getTypesScope, createType, createTypes, getActionType, getActionTypeKey};
