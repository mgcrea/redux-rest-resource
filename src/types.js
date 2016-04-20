
const upperSnakeCase = (string) =>
  String(string.split('').reduce((soFar, letter, index) => {
    const charCode = letter.charCodeAt(0);
    return soFar + (index && charCode < 97 ? `_${letter}` : letter).toUpperCase();
  }, ''));

const getNamespace = ({name}) =>
  `@@resource/${upperSnakeCase(name)}`;

const getActionKey = ({name, pluralName, actionKey, actionOpts = {}}) => {
  // `${actionKey.toUpperCase()}`;
  const _pluralName = pluralName || `${name}s`;
  return `${actionKey.toUpperCase()}_${upperSnakeCase(actionOpts.isArray ? _pluralName : name)}`;
};

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
