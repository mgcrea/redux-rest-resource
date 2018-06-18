# Default Actions

```js
import {defaultActions} from 'redux-rest-resource';

defaultActions ==
  {
    create: {
      method: 'POST'
    },
    fetch: {
      method: 'GET',
      isArray: true
    },
    get: {
      method: 'GET'
    },
    update: {
      method: 'PATCH'
    },
    updateMany: {
      method: 'PATCH',
      isArray: true,
      alias: 'update' // to have `updateUsers` vs. `updateManyUsers`
    },
    delete: {
      method: 'DELETE'
    },
    deleteMany: {
      method: 'DELETE',
      isArray: true,
      alias: 'delete' // to have `deleteUsers` vs. `deleteManyUsers`
    }
  };
```
