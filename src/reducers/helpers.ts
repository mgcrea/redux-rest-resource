import {AnyAction, Reducer} from 'redux';

const reduceReducers = <S>(...reducers: Reducer<S, AnyAction>[]): Reducer<S, AnyAction> => (state, action): S =>
  reducers.reduce<S>((stateSoFar, reducer) => reducer(stateSoFar, action), state as S);

const combineReducers = <S>(...reducers: Record<string, Reducer<S, AnyAction>>[]): Reducer<S, AnyAction> => (
  state,
  action
): S =>
  reducers.reduce<S>(
    (stateSoFar, reducerMap) =>
      Object.keys(reducerMap).reduce((innerStateSoFar, key) => {
        const reducer = reducerMap[key];
        const previousStateForKey = (stateSoFar[key as keyof S] as unknown) as S;
        const nextStateForKey = reducer(previousStateForKey, action);
        return {...innerStateSoFar, [key]: nextStateForKey};
      }, stateSoFar),
    state as S
  );

const mergeReducers = <S>(
  baseReducer: Reducer<S, AnyAction>,
  ...reducers: Record<string, Reducer<S, AnyAction>>[]
): Reducer<S, AnyAction> => {
  const combinedReducers = combineReducers<S>(...reducers);
  return (state, action): S => combinedReducers(baseReducer(state, action), action);
};

export {reduceReducers, combineReducers, mergeReducers};
