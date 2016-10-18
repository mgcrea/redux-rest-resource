# Headers Override

You can add/override headers for a single action

```js
import {createResource} from 'redux-rest-resource';

const hostUrl = 'https://api.mlab.com:443/api/1/databases/sandbox/collections';
const jwt = 'xvDjirE9MCIi800xMxi4EKeTm8e9FUBR';

export const {types, actions, reducers} = createResource({
  name: 'user',
  url: `${hostUrl}/users/:id?apiKey=${apiKey}`,
  actions: {
    fetch: {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    }
  }
});
```

Or globally for all actions

```js
import {defaultHeaders} from 'redux-rest-resource';
const jwt = 'xvDjirE9MCIi800xMxi4EKeTm8e9FUBR';
Object.assign(defaultHeaders, {Authorization: `Bearer ${jwt}`});
```
