
const defaultActions = {
  create: {method: 'POST', alias: 'save'},
  fetch: {method: 'GET', isArray: true},
  get: {method: 'GET'},
  update: {method: 'PATCH'},
  delete: {method: 'DELETE'}
};

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

const defaultTransformResponsePipeline = [
  res => res.json().then((body) => ({body, code: res.status}))
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
  isCreating: false,
  // UPDATE props
  isUpdating: false,
  // DELETE props
  isDeleting: false
};

export {
  defaultActions,
  defaultHeaders,
  defaultTransformResponsePipeline,
  initialState
};
