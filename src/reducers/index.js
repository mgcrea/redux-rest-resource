import {initialState} from '../defaults';
import {getTypesScope, getActionType} from '../types';
import {find, getGerundName, getIdKey, isFunction, isObject, ucfirst} from '../helpers/util';

const getUpdateArrayData = (action, itemId) => {
  const actionOpts = action.options || {};
  const idKey = getIdKey(action, {multi: false});

  return actionOpts.assignResponse
    ? find(action.body, {
        [idKey]: itemId
      })
    : Object.keys(action.context).reduce((soFar, key) => {
        if (key !== 'ids') {
          soFar[key] = action.context[key];
        }
        return soFar;
      }, {});
};

const defaultReducers = {
  create: (state, action) => {
    switch (action.status) {
      case 'pending':
        // Add object to store as soon as possible?
        return {
          ...state,
          isCreating: true
          // items: [{
          //   id: state.items.reduce((maxId, obj) => Math.max(obj.id, maxId), -1) + 1,
          //   ...action.context
          // }, ...state.items]
        };
      case 'resolved':
        // Assign returned object
        return {
          ...state,
          isCreating: false,
          items: [...(state.items || []), action.body]
        };
      case 'rejected':
        return {
          ...state,
          isCreating: false
        };
      default:
        return state;
    }
  },
  fetch: (state, action) => {
    switch (action.status) {
      case 'pending': {
        const actionOpts = action.options || {};
        const didInvalidate = !!actionOpts.invalidateState;
        return {
          ...state,
          isFetching: true,
          didInvalidate,
          ...(didInvalidate ? {items: []} : {})
        };
      }
      case 'resolved': {
        const isPartialContent = action.code === 206;
        let items = [];
        if (isPartialContent && action.contentRange) {
          const {contentRange} = action;
          if (contentRange.first > 0) {
            items = items.concat(state.items.slice(0, contentRange.last));
          }
          for (let i = contentRange.first; i <= contentRange.last; i += 1) {
            const newItem = action.body[i - contentRange.first];
            if (newItem != null) {
              items.push(newItem);
            }
          }
        } else {
          items = items.concat(action.body);
        }

        return {
          ...state,
          isFetching: false,
          didInvalidate: false,
          items,
          lastUpdated: action.receivedAt
        };
      }
      case 'rejected':
        return {
          ...state,
          isFetching: false
        };
      default:
        return state;
    }
  },
  get: (state, action) => {
    switch (action.status) {
      case 'pending': {
        const actionOpts = action.options || {};
        const idKey = getIdKey(action, {multi: false});
        const {context} = action;
        const {item} = state;
        const hasConflictingContext = item ? item[idKey] !== context[idKey] : false;
        const didInvalidate = !!actionOpts.invalidateState || hasConflictingContext;
        return {
          ...state,
          isFetchingItem: true,
          didInvalidateItem: didInvalidate,
          ...(didInvalidate ? {item: null} : {})
        };
      }
      case 'resolved': {
        const actionOpts = action.options || {};
        const idKey = getIdKey(action, {multi: false});
        const item = action.body;
        const update = {};
        if (actionOpts.assignResponse) {
          const updatedItems = state.items;
          const listItemIndex = updatedItems.findIndex(el => el[idKey] === item[idKey]);
          if (listItemIndex !== -1) {
            updatedItems.splice(listItemIndex, 1, item);
            update.items = updatedItems.slice();
          }
        }
        return {
          ...state,
          isFetchingItem: false,
          didInvalidateItem: false,
          lastUpdatedItem: action.receivedAt,
          item,
          ...update
        };
      }
      case 'rejected':
        return {
          ...state,
          isFetchingItem: false
        };
      default:
        return state;
    }
  },
  update: (state, action) => {
    switch (action.status) {
      case 'pending':
        // Update object in store as soon as possible?
        return {
          ...state,
          isUpdating: true
        };
      case 'resolved': {
        // Assign context or returned object
        const idKey = getIdKey(action, {multi: false});
        const id = isObject(action.context) ? action.context[idKey] : action.context;
        const actionOpts = action.options || {};
        const update = actionOpts.assignResponse ? action.body : action.context;
        const listItemIndex = state.items.findIndex(el => el[idKey] === id);
        const updatedItems = state.items.slice();
        if (listItemIndex !== -1) {
          updatedItems[listItemIndex] = {
            ...updatedItems[listItemIndex],
            ...update
          };
        }
        const updatedItem =
          state.item && state.item[idKey] === id
            ? {
                ...state.item,
                ...update
              }
            : state.item;
        return {
          ...state,
          isUpdating: false,
          items: updatedItems,
          item: updatedItem
        };
      }
      case 'rejected':
        return {
          ...state,
          isUpdating: false
        };
      default:
        return state;
    }
  },
  updateMany: (state, action) => {
    switch (action.status) {
      case 'pending':
        // Update object in store as soon as possible?
        return {
          ...state,
          isUpdatingMany: true
        };
      case 'resolved': {
        // Assign context or returned object
        const actionOpts = action.options || {};
        const idKey = getIdKey(action, {multi: false});
        const idKeyMulti = getIdKey(action, {multi: true});
        const {[idKeyMulti]: ids} = actionOpts.query || action.context;

        const updatedItems = state.items.map(item => {
          if (!ids || ids.includes(item[idKey])) {
            const updatedItem = getUpdateArrayData(action, item[idKey]);
            return updatedItem
              ? {
                  ...item,
                  ...updatedItem
                }
              : item;
          }
          return item;
        });
        // Also impact state.item? (@TODO opt-in/defautl?)
        const updatedItem =
          state.item && (!ids || ids.includes(state.item[idKey]))
            ? {
                ...state.item,
                ...getUpdateArrayData(action, state.item[idKey])
              }
            : state.item;
        return {
          ...state,
          isUpdatingMany: false,
          items: updatedItems,
          item: updatedItem
        };
      }
      case 'rejected':
        return {
          ...state,
          isUpdatingMany: false
        };
      default:
        return state;
    }
  },
  delete: (state, action) => {
    switch (action.status) {
      case 'pending':
        // Update object in store as soon as possible?
        return {
          ...state,
          isDeleting: true
        };
      case 'resolved': {
        const idKey = getIdKey(action, {multi: false});
        const id = action.context[idKey] || action.context;
        return {
          ...state,
          isDeleting: false,
          items: [...state.items.filter(el => el[idKey] !== id)]
        };
      }
      case 'rejected':
        return {
          ...state,
          isDeleting: false
        };
      default:
        return state;
    }
  },
  deleteMany: (state, action) => {
    switch (action.status) {
      case 'pending':
        // Update object in store as soon as possible?
        return {
          ...state,
          isDeletingMany: true
        };
      case 'resolved': {
        const actionOpts = action.options || {};
        const idKey = getIdKey(action, {multi: false});
        const idKeyMulti = getIdKey(action, {multi: true});
        const {[idKeyMulti]: ids} = actionOpts.query || action.context;

        if (!ids) {
          return {
            ...state,
            isDeletingMany: false,
            items: [],
            item: null
          };
        }
        return {
          ...state,
          isDeletingMany: false,
          items: [...state.items.filter(el => !ids.includes(el[idKey]))],
          item: state.item && ids.includes(state.item[idKey]) ? null : state.item
        };
      }
      case 'rejected':
        return {
          ...state,
          isDeletingMany: false
        };
      default:
        return state;
    }
  }
};

const createReducer = (actionId, {resourceName, resourcePluralName = `${resourceName}s`, ...actionOpts}) => {
  // Custom reducers
  if (actionOpts.reduce && isFunction(actionOpts.reduce)) {
    return actionOpts.reduce;
  }
  // Do require a custom reduce function for pure actions
  if (actionOpts.isPure) {
    throw new Error(`Missing \`reduce\` option for pure action \`${actionId}\``);
  }
  // Default reducers
  if (defaultReducers[actionId]) {
    return defaultReducers[actionId];
  }
  // Custom actions
  const gerundName = actionOpts.gerundName || getGerundName(actionId);
  const gerundStateKey = `is${ucfirst(gerundName)}`;
  return (state, action) => {
    switch (action.status) {
      case 'pending':
        // Update object in store as soon as possible?
        return {
          ...state,
          [gerundStateKey]: true
        };
      case 'resolved': // eslint-disable-line
        return {
          ...state,
          [gerundStateKey]: false
        };
      case 'rejected':
        return {
          ...state,
          [gerundStateKey]: false
        };
      default:
        return state;
    }
  };
};

const createReducers = (actions = {}, {resourceName, resourcePluralName, ...globalOpts} = {}) => {
  const actionKeys = Object.keys(actions);
  return actionKeys.reduce((actionReducers, actionId) => {
    const actionOpts = {
      ...globalOpts,
      ...actions[actionId]
    };
    const reducerKey = getActionType(actionId).toLowerCase();
    actionReducers[reducerKey] = createReducer(actionId, {
      resourceName,
      resourcePluralName,
      ...actionOpts
    });
    return actionReducers;
  }, {});
};

const createRootReducer = (
  reducers = {},
  {resourceName, resourcePluralName, scope = getTypesScope(resourceName), ...globalOpts} = {}
) => {
  const scopeNamespace = scope ? `${scope}/` : '';
  const rootReducer = (
    state = {
      ...initialState
    },
    action
  ) => {
    // Only process relevant namespace
    if (scopeNamespace && !String(action.type).startsWith(scopeNamespace)) {
      return state;
    }
    // Only process relevant action type
    const type = action.type.substr(scopeNamespace.length).toLowerCase();
    // Check for a matching reducer
    if (reducers[type]) {
      return reducers[type](state, action);
    }
    return state;
  };
  return rootReducer;
};

export {initialState, defaultReducers, createReducer, createReducers, createRootReducer};
