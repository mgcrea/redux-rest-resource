/// <reference path="index.d.ts" />

import {Action as ReduxAction, Reducer as ReduxReducer} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {SerializableResponse} from 'src/helpers/fetch';

export type UnknownObject = Record<string, unknown>;

export type ActionOptions = {
  alias?: string;
  assignResponse?: boolean;
  gerundName?: string;
  isArray?: boolean;
  isPure?: boolean;
  method?: RequestInit['method'];
  name?: string;
  url?: string;
};

export type ActionsOptions = Record<string, ActionOptions>;

export type State<T = UnknownObject> = {
  didInvalidate: boolean;
  didInvalidateItem: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  isFetching: boolean;
  isFetchingItem: boolean;
  isUpdating: boolean;
  item: T | null;
  items: Array<T>;
  lastUpdated: number;
  lastUpdatedItem: number;
};

export type ReduceOptions<T extends UnknownObject = UnknownObject> = {
  invalidateState?: boolean;
  assignResponse?: boolean;
  isArray?: boolean;
  isPure?: boolean;
  reduce?: Reducer<T>;
  gerundName?: string;
};

export type FetchOptions = Pick<RequestInit, 'method' | 'headers' | 'credentials' | 'signal'> & {
  url?: string;
  query?: Record<string, unknown>;
  body?: string | Record<string, unknown> | Array<unknown>;
  Promise?: PromiseConstructor;
};

export type Context = undefined | string | Record<string, unknown>;

export type ContextOptions = Partial<FetchOptions & ReduceOptions>;

export type ContentRange = {
  unit: string | number;
  first: number;
  last: number;
  length: number | null;
};

export type Types = Record<string, string>;

export type Action<T = unknown> = ReduxAction<string> &
  Partial<SerializableResponse<T>> & {
    status: 'pending' | 'resolved' | 'rejected';
    options: ContextOptions;
    context: Context;
    receivedAt?: number;
  };

export type Reducer<T = UnknownObject> = ReduxReducer<State<T>, Action>;
export type ReducerMapObject<T = UnknownObject> = Record<string, Reducer<T>>;

export type AsyncActionCreator<T = unknown> = (
  context?: Context,
  contextOpts?: ContextOptions
) => ThunkAction<Promise<Action<T>>, State, void, Action<T>>;

export type AsyncActionCreatorsMapObject<T = unknown> = Record<string, AsyncActionCreator<T>>;

export type UnwrapAsyncActionCreatorsMapObject<
  T extends Record<string, AsyncActionCreator>
> = T extends AsyncActionCreatorsMapObject<infer A>
  ? Record<string, (context?: Context, contextOpts?: ContextOptions) => Promise<Action<A>>>
  : T;

export type BeforeErrorPipeline = Array<(err: Error) => Error | null>;

/*
export type ThunkAction<R, S, E, A extends Action> = (
  dispatch: ThunkDispatch<S, E, A>,
  getState: () => S,
  extraArgument: E
) => R;
*/
