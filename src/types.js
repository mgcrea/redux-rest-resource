import {defaultActions} from './defaults';

const getActionType = ({name, actionKey}) =>
  // `${actionKey.toUpperCase()}_${name.toUpperCase()}${action.isArray ? 'S' : ''}`;
  `@@resource/${name}/${actionKey.toUpperCase()}`;

const createTypes = ({name}) => {
  const types = {};
  Object.keys(defaultActions).forEach(actionKey => {
    const action = defaultActions[actionKey];
    const type = getActionType({name, action, actionKey});
    types[actionKey.toUpperCase()] = type;
  });
  return types;
};

export {createTypes, getActionType};
