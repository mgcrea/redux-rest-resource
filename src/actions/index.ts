import {defaultTransformResponsePipeline} from '../defaults/pipeline';
import fetch, {buildFetchOpts, buildFetchUrl, HttpError} from '../helpers/fetch';
import {parseUrlParams} from '../helpers/url';
import {getPluralName, isFunction, isObject, isString, pick, ucfirst} from '../helpers/util';
import {getActionType, getTypesScope, scopeType} from '../types';
import {
  Action,
  ActionsOptions,
  AsyncActionCreator,
  Context,
  ContextOptions,
  FetchOptions,
  ReduceOptions,
  State
} from '../typings';
import {AnyTransform, applyTransformPipeline, buildTransformPipeline} from './transform';
import {BeforeErrorPipeline} from 'src/typings';

const SUPPORTED_FETCH_OPTS: Array<keyof FetchOptions> = [
  'url',
  'method',
  'headers',
  'credentials',
  'query',
  'body',
  'signal'
];
const SUPPORTED_REDUCE_OPTS: Array<keyof ReduceOptions> = ['invalidateState', 'assignResponse', 'isArray', 'isPure'];

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
    transformResponse?: AnyTransform;
    beforeError?: BeforeErrorPipeline;
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
  return (context: Context, contextOpts: ContextOptions = {}) => (dispatch, getState): Promise<Action> => {
    // Prepare reduce options
    const reduceOpts: ReduceOptions = {
      ...pick(actionOpts, ...SUPPORTED_REDUCE_OPTS),
      ...pick(contextOpts, ...SUPPORTED_REDUCE_OPTS)
    };
    // Support pure actions
    if (actionOpts.isPure) {
      return Promise.resolve(
        dispatch({
          type,
          status: 'resolved',
          options: reduceOpts,
          context
        })
      );
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
    const finalFetchUrl = buildFetchUrl(context, {
      url,
      urlParams,
      stripTrailingSlashes
    });
    const finalFetchOpts = buildFetchOpts(context, eligibleFetchOptions);
    return fetch(finalFetchUrl, finalFetchOpts)
      .then(
        applyTransformPipeline(
          buildTransformPipeline(defaultTransformResponsePipeline as Array<AnyTransform>, actionOpts.transformResponse)
        )
      )
      .then((payload) =>
        dispatch({
          type,
          status: 'resolved',
          context,
          options: reduceOpts,
          receivedAt: Date.now(),
          ...(isObject(payload) ? (payload as Partial<Action>) : {})
        })
      )
      .catch((initialErr: Error) => {
        // beforeError hook
        const err = actionOpts.beforeError
          ? actionOpts.beforeError.reduce<Error | null>(
              (errSoFar, beforeErrorHook) => (errSoFar ? beforeErrorHook(errSoFar) : null),
              initialErr
            )
          : initialErr;
        if (err === null) {
          // no-op action
          return {type} as Action;
        }
        if (!(err instanceof Error) && 'type' in err) {
          return err as Action;
        }
        // Catch HttpErrors
        if (err instanceof HttpError) {
          dispatch({
            type,
            status: 'rejected',
            code: err.status,
            body: err.body,
            context,
            options: reduceOpts,
            receivedAt: Date.now()
          });
          // Catch regular Errors
        } else {
          dispatch({
            type,
            status: 'rejected',
            code: null,
            body: err.message,
            context,
            options: reduceOpts,
            receivedAt: Date.now()
          });
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
  transformResponse?: AnyTransform;
  beforeError?: BeforeErrorPipeline;
} & FetchOptions &
  ReduceOptions;

const createActions = (
  actions: ActionsOptions = {},
  {
    resourceName,
    resourcePluralName = getPluralName(resourceName),
    scope = getTypesScope(resourceName),
    ...globalOpts
  }: CreateActionsOptions
): Record<string, AsyncActionCreator> => {
  const actionKeys = Object.keys(actions);
  return actionKeys.reduce<Record<string, AsyncActionCreator>>((actionFuncs, actionId) => {
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
