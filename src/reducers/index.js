
// http://facebook.github.io/react/docs/update.html

import {/* defaultState, */initialState} from './../defaults';
import {getNamespace} from './../types';

const reducers = {
  create: (state, action) => {
    switch (action.status) {
      case 'pending':
        // Add object to store as soon as possible?
        return {...state,
          isCreating: true
          // items: [{
          //   id: state.items.reduce((maxId, obj) => Math.max(obj.id, maxId), -1) + 1,
          //   ...action.context
          // }, ...state.items]
        };
      case 'resolved':
        // Assign returned object
        return {...state,
          isCreating: false,
          items: [...state.items, action.body]
        };
      case 'rejected':
        return {...state,
          isCreating: false
        };
      default:
        return state;
    }
  },
  fetch: (state, action) => {
    switch (action.status) {
      case 'pending':
        return {...state,
          isFetching: true,
          didInvalidate: false
        };
      case 'resolved':
        return {...state,
          isFetching: false,
          didInvalidate: false,
          items: action.body,
          lastUpdated: action.receivedAt
        };
      case 'rejected':
        return {...state,
          isFetching: false,
          didInvalidate: false
        };
      default:
        return state;
    }
  },
  get: (state, action) => {
    switch (action.status) {
      case 'pending':
        return {...state,
          isFetchingItem: true,
          didInvalidateItem: false
        };
      case 'resolved': {
        const actionOpts = action.options || {};
        const item = action.body;
        const update = {};
        if (actionOpts.assignResponse) {
          const updatedItems = state.items;
          const listItemIndex = updatedItems.findIndex(el => el.id === item.id);
          if (listItemIndex !== -1) {
            updatedItems.splice(listItemIndex, 1, item);
            update.items = updatedItems.slice();
          }
        }
        return {...state,
          isFetchingItem: false,
          didInvalidateItem: false,
          lastUpdatedItem: action.receivedAt,
          item,
          ...update
        };
      }
      case 'rejected':
        return {...state,
          isFetchingItem: false,
          didInvalidateItem: false
        };
      default:
        return state;
    }
  },
  update: (state, action) => {
    switch (action.status) {
      case 'pending':
        // Update object in store as soon as possible?
        return {...state,
          isUpdating: true
        };
      case 'resolved': {
        // Assign context or returned object
        const id = action.context.id || action.context;
        const actionOpts = action.options || {};
        const update = actionOpts.assignResponse ? action.body : action.context;
        const listItemIndex = state.items.findIndex(el => el.id === id);
        const updatedItems = state.items;
        if (listItemIndex !== -1) {
          const updatedItem = {...state.items.splice(listItemIndex, 1)[0], ...update};
          updatedItems.splice(listItemIndex, 0, updatedItem);
        }
        const updatedItem = state.item && state.item.id === id
          ? {...state.item, ...update}
          : state.item;
        return {...state,
          isUpdating: false,
          items: listItemIndex !== -1 ? updatedItems.slice() : updatedItems,
          item: updatedItem
        };
      }
      case 'rejected':
        return {...state,
          isUpdating: false
        };
      default:
        return state;
    }
  },
  delete: (state, action) => {
    switch (action.status) {
      case 'pending':
        // Update object in store as soon as possible?
        return {...state,
          isDeleting: true
        };
      case 'resolved': // eslint-disable-line
        const id = action.context.id || action.context;
        return {...state,
          isDeleting: false,
          items: [...state.items.filter(el => el.id !== id)]
        };
      case 'rejected':
        return {...state,
          isDeleting: false
        };
      default:
        return state;
    }
  }
};

const createReducers = ({name}) => {
  const namespace = `${getNamespace({name})}/`;
  // const localInitialState = {
  //   ...Object.keys(defaultState).reduce((soFar, key) => ({...soFar, ...defaultState[key]}), {}),
  //   ...initialState
  // };
  return (state = {...initialState, name}, action) => {
    // Only process relevant namespace
    if (!String(action.type).startsWith(namespace)) {
      return state;
    }
    // Only process relevant action type
    const type = action.type.substr(namespace.length).toLowerCase();
    if (reducers[type]) {
      return reducers[type](state, action);
    }
    return state;
  };
};

export {initialState, reducers, createReducers};
