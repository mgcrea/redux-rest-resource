# Reducers

**Reducers** are pure functions that takes the previous state and an action, and returns the next state.

```js
(previousState, action) => newState
```

#### Exported store state

**Redux REST Resource** will manage the state for you and store related data inside it. You have state-related booleans (like `isFetching`) that enables smooth UI feedback.

```js
import {initialState} from 'redux-rest-resource';

initialState == {
  // FETCH props
  items: [],
  isFetching: false,
  lastUpdated: 0,
  didInvalidate: true,
  // GET props
  item: null,
  isFetchingItem: false,
  lastUpdatedItem: 0,
  didInvalidateItem: true,
  // CREATE props
  isCreating: false,
  // UPDATE props
  isUpdating: false,
  // DELETE props
  isDeleting: false
};
```
