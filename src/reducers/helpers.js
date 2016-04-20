const reduceReducers = (...reducers) =>
  (state, action) =>
    reducers.reduce(
      (stateSoFar, reducer) => reducer(stateSoFar, action),
      state
    );

const combineReducers = (...reducers) =>
  (state = {}, action) =>
    reducers.reduce(
      (stateSoFar, reducerMap) =>
        Object.keys(reducerMap).reduce((_, key) => {
          const reducer = reducerMap[key];
          const previousStateForKey = stateSoFar[key];
          const nextStateForKey = reducer(previousStateForKey, action);
          return {...stateSoFar, [key]: nextStateForKey};
        }, stateSoFar),
      state
    );

const mergeReducers = (baseReducer, ...reducers) => {
  const combinedReducers = combineReducers.apply(null, reducers);
  return (state, action) =>
    baseReducer(combinedReducers(state, action), action);
};

export {reduceReducers, combineReducers, mergeReducers};
