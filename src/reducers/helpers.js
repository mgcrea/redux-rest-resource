const reduceReducers = (...reducers) =>
  (state, action) =>
    reducers.reduce(
      (stateSoFar, reducer) => reducer(stateSoFar, action),
      state
    );

const combineReducers = (...reducers) =>
  (state = {}, action) => (
    reducers.reduce(
      (stateSoFar, reducerMap) =>
        Object.keys(reducerMap).reduce((innerStateSoFar, key) => {
          const reducer = reducerMap[key];
          const previousStateForKey = stateSoFar[key];
          const nextStateForKey = reducer(previousStateForKey, action);
          return {...innerStateSoFar, [key]: nextStateForKey};
        }, stateSoFar),
      state
    )
  );

const mergeReducers = (baseReducer, ...reducers) => {
  const combinedReducers = combineReducers(...reducers);
  return (state, action) =>
    combinedReducers(baseReducer(state, action), action);
};

export {reduceReducers, combineReducers, mergeReducers};
