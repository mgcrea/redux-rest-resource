# Single Action

We also expose a helper to generate a store module for quick single action setup (eg. a basic fetch).

```js
const url = 'https://foo.com/users/:id';
export const {types, actions, rootReducer} = createResourceAction({
  name: 'environment',
  method: 'GET',
  url,
  headers: {
    Authorization: `Bearer ${apiJwt}`
  },
  credentials: 'include'
});
```
