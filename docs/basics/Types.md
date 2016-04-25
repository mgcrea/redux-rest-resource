# Types

**Action types** are strings that indicates the type of action being performed.

#### Exported action types

**Redux REST Resource** does expose action types that will be used in dispatched actions.

```js
types == {
  "CREATE_USER": "@@resource/USER/CREATE",
  "FETCH_USERS": "@@resource/USER/FETCH",
  "GET_USER":    "@@resource/USER/GET",
  "UPDATE_USER": "@@resource/USER/UPDATE",
  "DELETE_USER": "@@resource/USER/DELETE"
}
```
