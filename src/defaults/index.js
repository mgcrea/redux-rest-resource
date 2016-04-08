
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

export {
  defaultActions,
  defaultHeaders,
  defaultTransformResponsePipeline
};
