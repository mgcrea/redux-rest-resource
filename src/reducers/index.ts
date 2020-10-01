import {isPlainObject} from 'lodash';
import {defaultMergeItem, initialState as defaultInitialState} from '../defaults';
import {find, getGerundName, getIdKey, isFunction, isObject, isString, ucfirst} from '../helpers/util';
import {getActionType, getTypesScope} from '../types';
import {
  Action,
  ConfigActionsOptions,
  Context,
  ReduceOptions,
  Reducer,
  ReducerMapObject,
  State,
  UnknownObject
} from '../typings';

const getUpdateArrayData = (action: Action, itemId: string | number): UnknownObject | undefined => {
  const actionOpts = action.options || {};
  const idKey = getIdKey(action, {multi: false});
  if (!isPlainObject(action.context)) {
    return {};
  }
  const actionContext = action.context as UnknownObject;

  return actionOpts.assignResponse
    ? find(action.body as Array<UnknownObject>, {
        [idKey]: itemId
      })
    : Object.keys(actionContext).reduce<UnknownObject>((soFar, key) => {
        if (key !== 'ids') {
          soFar[key] = actionContext[key as keyof Context];
        }
        return soFar;
      }, {});
};

const getIdFromAction = (action: Action, {multi}: {multi: boolean}): [string, unknown] => {
  const idKey = getIdKey(action, {multi});
  const {context, options = {}} = action;
  const {params = {}} = options;
  if (params[idKey]) {
    return [idKey, params[idKey]];
  }
  if (isObject(context) && context[idKey]) {
    return [idKey, context[idKey]];
  }
  if (isString(context)) {
    return [idKey, context];
  }
  throw new Error(
    `Failed to resolve id with key="${idKey}" from context=${JSON.stringify(context)} or params=${JSON.stringify(
      params
    )}`
  );
};

const createDefaultReducers = <T extends UnknownObject>(reduceOptions: ReduceOptions<T>): ReducerMapObject<T> => {
  const initialState = defaultInitialState as State<T>;
  const mergeItem = reduceOptions.mergeItem || defaultMergeItem;
  return {
    create: (state = initialState, action): State<T> => {
      const actionOpts = action.options || {};
      switch (action.status) {
        case 'pending':
          // @TODO optimistic updates?
          return {
            ...state,
            isCreating: true
          };
        case 'resolved': {
          const nextState: Partial<State<T>> = {};
          if (actionOpts.assignResponse) {
            const createdItem = action.body as T;
            nextState.items = (state.items || []).concat(createdItem);
          }
          return {
            ...state,
            isCreating: false,
            ...nextState
          };
        }
        case 'rejected':
          return {
            ...state,
            isCreating: false
          };
        default:
          return state;
      }
    },
    fetch: (state = initialState, action) => {
      switch (action.status) {
        case 'pending': {
          const actionOpts = action.options || {};
          const didInvalidate = !!actionOpts.invalidateState;
          return {
            ...state,
            isFetching: true,
            didInvalidate,
            ...(didInvalidate ? {items: []} : {})
          };
        }
        case 'resolved': {
          const nextState: Partial<State<T>> = {};
          nextState.items = action.body as T[];
          const {contentRange} = action;
          const isPartialContent = action.code === 206;
          if (isPartialContent && contentRange && contentRange.first > 0) {
            nextState.items = state.items
              .slice(0, contentRange.first)
              .concat(nextState.items)
              .concat(state.items.slice(contentRange.last, state.items.length));
          }
          return {
            ...state,
            isFetching: false,
            didInvalidate: false,
            lastUpdated: action.receivedAt as number,
            ...nextState
          };
        }
        case 'rejected':
          return {
            ...state,
            isFetching: false
          };
        default:
          return state;
      }
    },
    get: (state = initialState, action) => {
      const actionOpts = action.options || {};
      switch (action.status) {
        case 'pending': {
          const [idKey, id] = getIdFromAction(action, {multi: false});
          const hasConflictingContext = id && state.item ? state.item[idKey] !== id : false;
          const didInvalidate = !!actionOpts.invalidateState || hasConflictingContext;
          return {
            ...state,
            isFetchingItem: true,
            didInvalidateItem: didInvalidate,
            ...(didInvalidate ? {item: null} : {})
          };
        }
        case 'resolved': {
          const partialItem = action.body as Partial<T>;
          const nextItem = (actionOpts.mergeResponse ? mergeItem(state.item, partialItem) : partialItem) as T;
          const nextState: Partial<State<T>> = {item: {...nextItem}};
          if (actionOpts.assignResponse) {
            const idKey = getIdKey(action, {multi: false});
            const prevListItemIndex = state.items.findIndex((el) => el[idKey] === partialItem[idKey]);
            if (prevListItemIndex !== -1) {
              const prevListItem = state.items[prevListItemIndex];
              const nextListItem = actionOpts.mergeResponse ? mergeItem(prevListItem, partialItem) : (partialItem as T);
              state.items.splice(prevListItemIndex, 1, nextListItem);
              nextState.items = state.items.slice();
            }
          }
          return {
            ...state,
            isFetchingItem: false,
            didInvalidateItem: false,
            lastUpdatedItem: action.receivedAt as number,
            ...nextState
          };
        }
        case 'rejected':
          return {
            ...state,
            isFetchingItem: false
          };
        default:
          return state;
      }
    },
    update: (state = initialState, action) => {
      const actionOpts = action.options || {};
      switch (action.status) {
        case 'pending':
          // Update object in store as soon as possible?
          return {
            ...state,
            isUpdating: true
          };
        case 'resolved': {
          // Assign context or returned object
          const [idKey, id] = getIdFromAction(action, {multi: false});
          const update = (actionOpts.assignResponse ? action.body : action.context) as UnknownObject;
          const listItemIndex = state.items.findIndex((el) => el[idKey] === id);
          const updatedItems = state.items.slice();
          if (listItemIndex !== -1) {
            updatedItems[listItemIndex] = {
              ...updatedItems[listItemIndex],
              ...update
            };
          }
          const updatedItem =
            state.item && state.item[idKey] === id
              ? {
                  ...state.item,
                  ...update
                }
              : state.item;
          return {
            ...state,
            isUpdating: false,
            items: updatedItems,
            item: updatedItem
          };
        }
        case 'rejected':
          return {
            ...state,
            isUpdating: false
          };
        default:
          return state;
      }
    },
    updateMany: (state = initialState, action) => {
      switch (action.status) {
        case 'pending':
          // Update object in store as soon as possible?
          return {
            ...state,
            isUpdatingMany: true
          };
        case 'resolved': {
          // Assign context or returned object
          const idKey = getIdKey(action, {multi: false});
          const [, ids] = getIdFromAction(action, {multi: true});

          const updatedItems = state.items.map((item) => {
            if (!ids || (ids as string[]).includes(item[idKey] as string)) {
              const updatedItem = getUpdateArrayData(action, item[idKey] as string);
              return updatedItem
                ? {
                    ...item,
                    ...updatedItem
                  }
                : item;
            }
            return item;
          });
          // Also impact state.item? (@TODO opt-in/defautl?)
          const updatedItem =
            state.item && (!ids || (ids as string[]).includes(state.item[idKey] as string))
              ? {
                  ...state.item,
                  ...getUpdateArrayData(action, state.item[idKey] as string)
                }
              : state.item;
          return {
            ...state,
            isUpdatingMany: false,
            items: updatedItems,
            item: updatedItem
          };
        }
        case 'rejected':
          return {
            ...state,
            isUpdatingMany: false
          };
        default:
          return state;
      }
    },
    delete: (state = initialState, action) => {
      switch (action.status) {
        case 'pending':
          // Update object in store as soon as possible?
          return {
            ...state,
            isDeleting: true
          };
        case 'resolved': {
          // @NOTE Do not update items array when an empty context was provided
          // Can happen with custom resource not using id params
          if (!action.context) {
            return {...state, isDeleting: false};
          }
          const [idKey, id] = getIdFromAction(action, {multi: false});
          return {
            ...state,
            isDeleting: false,
            items: [...state.items.filter((el) => el[idKey] !== id)]
          };
        }
        case 'rejected':
          return {
            ...state,
            isDeleting: false
          };
        default:
          return state;
      }
    },
    deleteMany: (state = initialState, action) => {
      switch (action.status) {
        case 'pending':
          // Update object in store as soon as possible?
          return {
            ...state,
            isDeletingMany: true
          };
        case 'resolved': {
          const idKey = getIdKey(action, {multi: false});
          const [, ids] = getIdFromAction(action, {multi: true});

          if (!ids) {
            return {
              ...state,
              isDeletingMany: false,
              items: [],
              item: null
            };
          }
          return {
            ...state,
            isDeletingMany: false,
            items: [...state.items.filter((el) => !(ids as string[]).includes(el[idKey] as string))],
            item: state.item && (ids as string[]).includes(state.item[idKey] as string) ? null : state.item
          };
        }
        case 'rejected':
          return {
            ...state,
            isDeletingMany: false
          };
        default:
          return state;
      }
    }
  };
};

const createReducer = <T extends UnknownObject>(
  actionId: string,
  reduceOptions: ReduceOptions<T>,
  defaultReducers = createDefaultReducers<T>(reduceOptions)
): Reducer<T> => {
  // Custom reducers
  if (reduceOptions.reduce && isFunction(reduceOptions.reduce)) {
    return reduceOptions.reduce;
  }
  // Do require a custom reduce function for pure actions
  if (reduceOptions.isPure) {
    throw new Error(`Missing \`reduce\` option for pure action \`${actionId}\``);
  }
  // Default reducers
  if (defaultReducers[actionId]) {
    return defaultReducers[actionId] as Reducer<T>;
  }
  // Custom actions
  const gerundName = reduceOptions.gerundName || getGerundName(actionId);
  const gerundStateKey = `is${ucfirst(gerundName)}`;
  return (state = defaultInitialState as State<T>, action): State<T> => {
    switch (action.status) {
      case 'pending':
        // Update object in store as soon as possible?
        return {
          ...state,
          [gerundStateKey]: true
        };
      case 'resolved': // eslint-disable-line
        return {
          ...state,
          [gerundStateKey]: false
        };
      case 'rejected':
        return {
          ...state,
          [gerundStateKey]: false
        };
      default:
        return state;
    }
  };
};

const createReducers = <T extends UnknownObject>(
  actions: ConfigActionsOptions = {},
  reduceOptions: ReduceOptions<T> = {}
): ReducerMapObject<T> => {
  const actionKeys = Object.keys(actions);
  const defaultReducers = createDefaultReducers<T>(reduceOptions);
  return actionKeys.reduce<ReducerMapObject<T>>((actionReducers, actionId) => {
    // d(omit(actions[actionId], SUPPORTED_REDUCE_OPTS));
    const combinedReduceOptions: ReduceOptions<T> = {
      ...reduceOptions,
      ...actions[actionId]
      // ...pick<ConfigActionOptions>(actions[actionId], (SUPPORTED_REDUCE_OPTS as unknown) as keyof ConfigActionOptions)
    };
    const reducerKey = getActionType(actionId).toLowerCase();
    actionReducers[reducerKey] = createReducer<T>(actionId, combinedReduceOptions, defaultReducers);
    return actionReducers;
  }, {});
};

type CreateRootReducerOptions = {
  resourceName: string;
  scope?: string;
};

const createRootReducer = <T extends UnknownObject>(
  reducers: ReducerMapObject<T> = {},
  {resourceName, scope = getTypesScope(resourceName)}: CreateRootReducerOptions
): Reducer<T> => {
  const scopeNamespace = scope ? `${scope}/` : '';
  const rootReducer: Reducer<T> = (
    state = {
      ...(defaultInitialState as State<T>)
    },
    action
  ) => {
    // Only process relevant namespace
    if (scopeNamespace && !String(action.type).startsWith(scopeNamespace)) {
      return state;
    }
    // Only process relevant action type
    const type = action.type.substr(scopeNamespace.length).toLowerCase();
    // Check for a matching reducer
    if (reducers[type]) {
      return reducers[type](state, action);
    }
    return state;
  };
  return rootReducer;
};

export {defaultInitialState as initialState, createReducer, createReducers, createRootReducer};
