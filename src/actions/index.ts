import {BeforeErrorPipeline, AsyncActionCreatorsMapObject} from 'src/typings';
import {defaultTransformResponsePipeline} from '../defaults/pipeline';
import fetch, {
  buildFetchOpts,
  buildFetchUrl,
  HttpError,
  SerializableResponse,
  serializeResponse
} from '../helpers/fetch';
import {parseUrlParams} from '../helpers/url';
import {getPluralName, isFunction, isObject, isString, pick, ucfirst} from '../helpers/util';
import {getActionType, getTypesScope, scopeType} from '../types';
import {
  ConfigActionsOptions,
  AsyncActionCreator,
  Context,
  ContextOptions,
  FetchOptions,
  ReduceOptions,
  State
} from '../typings';
import {AnyTransform, applyTransformPipeline, buildTransformPipeline} from './transform';
export const SUPPORTED_FETCH_OPTS = ['url', 'method', 'headers', 'credentials', 'query', 'body', 'signal'] as const;
export const SUPPORTED_REDUCE_OPTS = [
  'assignResponse',
  'gerundName',
  'invalidateState',
  'isArray',
  'isPure',
  'mergeResponse',
  'params',
  'reduce'
] as const;

type GetActionNameOptions = {
  resourceName: string;
  resourcePluralName?: string;
  isArray?: boolean;
  alias?: string;
};

const getActionName = (
  actionId: string,
  {resourceName, resourcePluralName = getPluralName(resourceName), isArray = false, alias}: GetActionNameOptions
): string => (!resourceName ? actionId : `${alias || actionId}${ucfirst(isArray ? resourcePluralName : resourceName)}`);

export type CreateActionOptions = FetchOptions &
  ReduceOptions & {
    scope?: string;
    stripTrailingSlashes?: boolean;
    transformResponse?: AnyTransform<SerializableResponse>;
    beforeError?: BeforeErrorPipeline;
    alias?: string;
  };

const createAction = (
  actionId: string,
  {scope, stripTrailingSlashes = true, ...actionOpts}: CreateActionOptions
): AsyncActionCreator => {
  const type = scopeType(getActionType(actionId), scope);
  // Actual action function with two args
  // Context usage changes with resolved method:
  // - GET/DELETE will be used to resolve query params (eg. /users/:id)
  // - POST/PATCH will be used to resolve query params (eg. /users/:id) and as request body
  return (context: Context, contextOpts: ContextOptions = {}) => (
    dispatch,
    getState
  ): Promise<SerializableResponse | null> => {
    // Prepare reduce options
    const reduceOpts: ReduceOptions = {
      ...pick(actionOpts, ...SUPPORTED_REDUCE_OPTS),
      ...pick(contextOpts, ...SUPPORTED_REDUCE_OPTS)
    };
    // Support pure actions
    if (actionOpts.isPure) {
      dispatch({
        type,
        status: 'resolved',
        options: reduceOpts,
        context
      });
      return Promise.resolve(null);
    }
    // First dispatch a pending action
    dispatch({
      type,
      status: 'pending',
      options: reduceOpts,
      context
    });
    // Prepare fetch options
    const fetchOpts: FetchOptions = {
      ...pick(actionOpts, ...SUPPORTED_FETCH_OPTS),
      ...pick(contextOpts, ...SUPPORTED_FETCH_OPTS)
    };
    // Support dynamic fetch options
    const resolvedfetchOpts: FetchOptions = Object.keys(fetchOpts).reduce<Record<string, unknown>>((soFar, key) => {
      soFar[key] = isFunction(fetchOpts[key as keyof FetchOptions])
        ? ((fetchOpts[key as keyof FetchOptions] as unknown) as (
            getState: () => State,
            options: {context: Context; contextOpts: ContextOptions; actionId: string}
          ) => unknown)(getState, {
            context,
            contextOpts,
            actionId
          })
        : fetchOpts[key as keyof FetchOptions];
      return soFar;
    }, {}) as FetchOptions;
    const {url = '', ...eligibleFetchOptions} = resolvedfetchOpts;
    // Build fetch url and options
    const urlParams = parseUrlParams(url);
    const finalFetchOpts = buildFetchOpts(context, eligibleFetchOptions);
    const finalFetchUrl = buildFetchUrl(context, {
      url,
      method: finalFetchOpts.method,
      params: reduceOpts.params,
      urlParams,
      stripTrailingSlashes,
      isArray: actionOpts.isArray
    });
    return fetch(finalFetchUrl, finalFetchOpts)
      .then(serializeResponse)
      .then(
        applyTransformPipeline<SerializableResponse>(
          buildTransformPipeline(defaultTransformResponsePipeline, actionOpts.transformResponse)
        )
      )
      .then((payload) => {
        dispatch({
          type,
          status: 'resolved',
          context,
          options: reduceOpts,
          payload
        });
        return payload;
      })
      .catch((err: Error) => {
        const payload: SerializableResponse =
          err instanceof HttpError
            ? {
                body: err.body,
                headers: err.headers,
                code: err.status, // deprecated
                status: err.status,
                ok: false,
                receivedAt: Date.now()
              }
            : {
                body: err.message,
                headers: {},
                code: 0, // deprecated
                status: 0,
                ok: false,
                receivedAt: Date.now()
              };

        // beforeError hook
        const nextErr = actionOpts.beforeError
          ? actionOpts.beforeError.reduce<Error | null>(
              (errSoFar, beforeErrorHook) => (errSoFar ? beforeErrorHook(errSoFar) : null),
              err
            )
          : err;

        dispatch({
          type,
          status: 'rejected',
          context,
          options: reduceOpts,
          payload
        });

        if (nextErr === null) {
          return payload;
        }
        if (!(err instanceof Error) && isObject(err)) {
          return err;
        }
        throw err;
      });
  };
};

type CreateActionsOptions = {
  resourceName: string;
  resourcePluralName?: string;
  scope?: string;
  stripTrailingSlashes?: boolean;
  transformResponse?: AnyTransform<SerializableResponse>;
  beforeError?: BeforeErrorPipeline;
} & FetchOptions &
  ReduceOptions;

const createActions = (
  actions: ConfigActionsOptions = {},
  {
    resourceName,
    resourcePluralName = getPluralName(resourceName),
    scope = getTypesScope(resourceName),
    ...globalOpts
  }: CreateActionsOptions
): AsyncActionCreatorsMapObject => {
  const actionKeys = Object.keys(actions);
  return actionKeys.reduce<AsyncActionCreatorsMapObject>((actionFuncs, actionId) => {
    // Add support for relative url override
    const {url} = actions[actionId];

    if (globalOpts.url && url && isString(url) && url.substr(0, 1) === '.') {
      actions[actionId] = {
        ...actions[actionId],
        url: `${globalOpts.url}${url.substr(1)}`
      };
    }
    const actionOpts = actions[actionId];
    const actionName: string = actionOpts.name
      ? actionOpts.name
      : getActionName(actionId, {
          resourceName,
          resourcePluralName,
          isArray: actionOpts.isArray,
          alias: actionOpts.alias
        });
    actionFuncs[actionName] = createAction(actionId, {
      scope,
      ...globalOpts,
      ...actionOpts
    });
    return actionFuncs;
  }, {});
};

export {getActionName, createAction, createActions};
