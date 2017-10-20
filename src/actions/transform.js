import {defaultGlobals} from './../defaults';

const buildTransformPipeline = (initial, transform) => {
  let transformResponsePipeline;
  if (transform) {
    transformResponsePipeline = Array.isArray(transform) ?
      transform :
      [...initial, transform];
  } else {
    transformResponsePipeline = [...initial];
  }
  return transformResponsePipeline;
};
const applyTransformPipeline = (pipeline) => { // eslint-disable-line arrow-body-style
  return initial => pipeline.reduce((soFar, fn) => soFar.then(fn), defaultGlobals.Promise.resolve(initial));
};

export {
  buildTransformPipeline,
  applyTransformPipeline
};
