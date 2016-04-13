
// http://facebook.github.io/react/docs/update.html

const initialState = {
  isFetching: false,
  didInvalidate: true,
  lastUpdated: 0,
  items: [],
  item: null,
  isFetchingItem: false
};

const createReducers = ({types}) => (state = initialState, action) => {
  if (!String(action.type).startsWith('@@resource/')) {
    return state;
  }
  // d(action);
  switch (action.type) {
    case types.CREATE:
      switch (action.status) {
        case 'pending':
          // Add object to store as soon as possible?
          return Object.assign({}, state, {
            isCreating: true
            // items: [{
            //   id: state.items.reduce((maxId, obj) => Math.max(obj.id, maxId), -1) + 1,
            //   ...action.context
            // }, ...state.items]
          });
        case 'resolved':
          // Assign returned object
          return Object.assign({}, state, {
            isCreating: false,
            items: [...state.items, action.body]
          });
        case 'rejected':
          return Object.assign({}, state, {
            isCreating: false
          });
        default:
          return state;
      }
    case types.FETCH:
      switch (action.status) {
        case 'pending':
          return Object.assign({}, state, {
            isFetching: true,
            didInvalidate: false
          });
        case 'resolved':
          return Object.assign({}, state, {
            isFetching: false,
            didInvalidate: false,
            items: action.body,
            lastUpdated: action.receivedAt
          });
        case 'rejected':
          return Object.assign({}, state, {
            isFetching: false,
            didInvalidate: false
          });
        default:
          return state;
      }
    case types.GET:
      switch (action.status) {
        case 'pending':
          return {...state,
            isFetchingItem: true
          };
        case 'resolved':
          return {...state,
            isFetchingItem: false,
            item: action.body
            // items: action.items,
            // lastUpdated: action.receivedAt
          };
        case 'rejected':
          return {...state,
            isFetchingItem: false
          };
        default:
          return state;
      }
    case types.UPDATE:
      switch (action.status) {
        case 'pending':
          // Update object in store as soon as possible?
          return Object.assign({}, state, {
            isUpdating: true
          });
        case 'resolved': {
          // Assign returned object
          const index = state.items.findIndex(el => el.id === action.context.id);
          const updatedItem = {...state.items.splice(index, 1)[0], ...action.context};
          return {...state,
            isUpdating: false,
            items: [...state.items, updatedItem]
          };
        }
        case 'rejected':
          return {...state,
            isUpdating: false
          };
        default:
          return state;
      }
    case types.DELETE:
      switch (action.status) {
        case 'pending':
          // Update object in store as soon as possible?
          return {...state,
            isDeleting: true
          };
        case 'resolved':
          return {...state,
            isDeleting: false,
            items: [...state.items.filter(el => el.id !== action.context.id)]
          };
        case 'rejected':
          return {...state,
            isDeleting: false
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export {initialState, createReducers};
