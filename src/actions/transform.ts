import {defaultGlobals} from '../defaults';

export type AnyTransform<T = unknown> = (value: T) => Promise<T>;

const buildTransformPipeline = <T = unknown>(
  initial: Array<AnyTransform<T>>,
  transform?: AnyTransform<T>
): Array<AnyTransform<T>> => {
  let transformResponsePipeline: Array<AnyTransform<T>>;
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
