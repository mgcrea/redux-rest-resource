# Resources

- **Resources** are ready-to-use store modules, simple javascript objects with the following structure:

```js
{
  types,
  actions,
  reducers,
  rootReducer
}
```

> @NOTE: reducers is currently also exposing the root reducer, but using rootReducer is the recommended way forward. Will break once 1.0 is reached.

- **Resources** are the ready-to-use abstraction for your REST related needs.

- They can be created with a simple factory function:

```js
import {createResource} from 'redux-rest-resource';

const hostUrl = 'https://api.mlab.com:443/api/1/databases/sandbox/collections';
const apiKey = 'xvDjirE9MCIi800xMxi4EKeTm8e9FUBR';

export const {types, actions, rootReducer} = createResource({
  name: 'user',
  url: `${hostUrl}/users/:id?apiKey=${apiKey}`
});
```

## Options

| **Option name** | **Type**        | **Description**                                       |
|-----------------|-----------------|-------------------------------------------------------|
| name            | String          | Actual name of the resource (required)                |
| url             | Function/String | Actual url of the resource (required)                 |
| pluralName      | String          | Plural name of the resource (optional)                |
| actions         | Object          | Action extra options, merged with defaults (optional) |

- You can also pass any [action related option](Actions.html#available-options) to set a global default.

```js
export const {types, actions, rootReducer} = createResource({
  name: 'user',
  url: `${hostUrl}/users/:id?apiKey=${apiKey}`,
  credentials: 'include',
  headers: {'X-Custom-Header': 'Some static header'}
});
```
