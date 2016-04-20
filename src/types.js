
const getNamespace = ({name}) =>
  `@@resource/${name.toUpperCase()}`;

const getActionKey = ({name, pluralName, actionKey, actionOpts = {}}) => {
  // `${actionKey.toUpperCase()}`;
  const _pluralName = pluralName || `${name}s`;
  return `${actionKey.toUpperCase()}_${(actionOpts.isArray ? _pluralName : name).toUpperCase()}`;
};

// @TODO snakeCase?
const getActionType = ({name, actionKey}) =>
  // `${actionKey.toUpperCase()}_${name.toUpperCase()}${action.isArray ? 'S' : ''}`;
  `${getNamespace({name})}/${actionKey.toUpperCase()}`;

const createTypes = ({name, actions}) => {
  const types = {};
  Object.keys(actions).forEach(actionKey => {
    const actionOpts = actions[actionKey];
    const type = getActionType({name, actionOpts, actionKey});
    types[getActionKey({name, actionOpts, actionKey})] = type;
  });
  return types;
};

export {createTypes, getNamespace, getActionKey, getActionType};
