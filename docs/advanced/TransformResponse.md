# Transform Response

- You can configure `transformResponse` for a specific action:

For instance if you want to sort by your response before it hits the store

```js
import {sortBy} from 'lodash';

export const {types, actions, reducers} = createResource({
  name: 'user',
  url: 'https://foo.com/users/:id',
  actions: {
    fetch: {
      transformResponse: (res) => ({res, body: sortBy(res.body, 'date')})
    },
    update: {
      headers: {
        'X-Custom-Header': 'foobar'
      }
    }
  }
});
```
