import {defaultGlobals} from '../defaults';

export type AnyTransform<T = unknown> = (value: T) => Promise<T>;

const buildTransformPipeline = (initial: Array<AnyTransform>, transform?: AnyTransform): Array<AnyTransform> => {
  let transformResponsePipeline: Array<AnyTransform>;
  if (transform) {
    transformResponsePipeline = Array.isArray(transform) ? transform : [...initial, transform];
  } else {
    transformResponsePipeline = [...initial];
  }
  return transformResponsePipeline;
};

const applyTransformPipeline = <T = unknown>(pipeline: Array<AnyTransform<T>>) => (initial: T): Promise<T> =>
  pipeline.reduce<Promise<T>>((soFar, fn) => soFar.then(fn), defaultGlobals.Promise.resolve(initial));

export {buildTransformPipeline, applyTransformPipeline};
