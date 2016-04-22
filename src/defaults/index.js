
const defaultActions = {
  create: {method: 'post', alias: 'save'},
  fetch: {method: 'get', isArray: true},
  get: {method: 'get'},
  update: {method: 'patch'},
  delete: {method: 'delete'}
};

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

const defaultTransformResponsePipeline = [
  res => res.json()
];

const initialState = {
  // FETCH props
  items: [],
  isFetching: false,
  lastUpdated: 0,
  didInvalidate: true,
  // GET props
  item: null,
  isFetchingItem: false,
  lastUpdatedItem: 0,
  didInvalidateItem: true,
  // CREATE props
  isCreating: true,
  // UPDATE props
  isUpdating: true,
  // DELETE props
  isDeleting: true
};

export {
  defaultActions,
  defaultHeaders,
  defaultTransformResponsePipeline,
  initialState
};
