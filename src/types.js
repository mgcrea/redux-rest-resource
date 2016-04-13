import {defaultActions} from './defaults';

const getActionKey = ({actionKey}) =>
  `${actionKey.toUpperCase()}`;

const getActionType = ({name, actionKey}) =>
  // `${actionKey.toUpperCase()}_${name.toUpperCase()}${action.isArray ? 'S' : ''}`;
  `@@resource/${name}/${actionKey.toUpperCase()}`;

const createTypes = ({name}) => {
  const types = {};
  Object.keys(defaultActions).forEach(actionKey => {
    const action = defaultActions[actionKey];
    const type = getActionType({name, action, actionKey});
    types[getActionKey({name, actionKey})] = type;
  });
  return types;
};

export {createTypes, getActionKey, getActionType};
