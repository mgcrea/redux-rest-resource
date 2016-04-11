
const d = ::console.info;

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
  switch (action.type) {
    case types.QUERY:
      switch (action.status) {
        case 'pending':
          return Object.assign({}, state, {
            isFetching: true,
            didInvalidate: false
          });
        case 'resolved':
          d(action.body);
          return Object.assign({}, state, {
            isFetching: false,
            didInvalidate: false,
            items: action.body,
            lastUpdated: action.receivedAt
          });
        default:
          return state;
      }
    case types.GET:
      switch (action.status) {
        case 'pending':
          return Object.assign({}, state, {
            isFetchingItem: true
          });
        case 'resolved':
          d(action.body);
          return Object.assign({}, state, {
            isFetchingItem: false,
            item: action.body
            // items: action.items,
            // lastUpdated: action.receivedAt
          });
        default:
          return state;
      }

    default:
      return state;
  }
};

export {initialState, createReducers};
