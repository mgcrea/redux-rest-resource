/// <reference path="index.d.ts" />

import {Action as ReduxAction} from 'redux';
import {ThunkAction} from 'redux-thunk';

export type AnyItem = Record<string, unknown>;

export type ActionOptions = {
  alias?: string;
  assignResponse?: boolean;
  gerundName?: string;
  isArray?: boolean;
  isPure?: boolean;
  method: RequestInit['method'];
  name?: string;
  url?: string;
};

export type ActionsOptions = Record<string, ActionOptions>;

export type State<T = AnyItem> = {
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

export type ReduceOptions = {
  invalidateState?: boolean;
  assignResponse?: boolean;
  isArray?: boolean;
  isPure?: boolean;
  reduce?: Reducer;
  gerundName?: string;
};

export type FetchOptions = Pick<RequestInit, 'method' | 'headers' | 'credentials' | 'signal'> & {
  url?: string;
  query?: Record<string, unknown>;
  body?: string | Record<string, unknown> | Array<unknown>;
  Promise?: PromiseConstructor;
};

export type Context = string | Record<string, unknown>;

export type ContextOptions = Partial<FetchOptions & ReduceOptions>;

export type ContentRange = {
  unit: string | number;
  first: number;
  last: number;
  length: number | null;
};

export type Types = Record<string, string>;

export type Action = ReduxAction<string> & {
  status: 'pending' | 'resolved' | 'rejected';
  options: ContextOptions;
  context: Context;
  code?: Response['status'] | null;
  body?: unknown;
  receivedAt?: number;
  contentRange?: ContentRange;
};

export type Reducer<S = State, A = Action> = (state: S, action: A) => S;
// export type Reducer = ReduxReducer<State, Action>;

export type AsyncActionCreator = (
  context: Context,
  contextOpts?: ContextOptions
) => ThunkAction<Promise<Action>, State, void, Action>;

export type BeforeErrorPipeline = Array<(err: Error) => Error | null>;
