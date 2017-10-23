# Headers Override

- You can configure `headers` globally:

```js
export const {types, actions, reducers} = createResource({
  name: 'user',
  url: 'https://foo.com/users/:id',
  headers: {
    'X-Custom-Header': 'foobar'
  }
});
```

- You may want to globally update default `headers` at run time (eg. you received a new JWT):

```js
import {defaultHeaders} from 'redux-rest-resource';
const jwt = 'xvDjirE9MCIi800xMxi4EKeTm8e9FUBR';
Object.assign(defaultHeaders, {Authorization: `Bearer ${jwt}`});
```

- You can also configure `headers` for a specific action:

```js
export const {types, actions, reducers} = createResource({
  name: 'user',
  url: 'https://foo.com/users/:id',
  actions: {
    update: {
      headers: {
        'X-Custom-Header': 'foobar'
      }
    }
  }
});
```

- Or as an one-time override at action call-time:

```js
actions.updateUser({firstName: 'Olivier'}, {headers: {Authorization: `Bearer ${jwt}`}});
```
