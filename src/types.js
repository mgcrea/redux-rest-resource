
const getActionKey = ({actionKey}) =>
  `${actionKey.toUpperCase()}`;

// @TODO snakeCase
const getActionType = ({name, actionKey}) =>
  // `${actionKey.toUpperCase()}_${name.toUpperCase()}${action.isArray ? 'S' : ''}`;
  `@@resource/${name.toUpperCase()}/${actionKey.toUpperCase()}`;

const createTypes = ({name, actions}) => {
  const types = {};
  Object.keys(actions).forEach(actionKey => {
    const action = actions[actionKey];
    const type = getActionType({name, action, actionKey});
    types[getActionKey({name, actionKey})] = type;
  });
  return types;
};

export {createTypes, getActionKey, getActionType};
