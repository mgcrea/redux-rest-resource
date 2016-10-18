# Assign Update Response

By default, the response of the update action (`PATCH` request) will be ignored.

If you want to assign the response body (eg. for complex populated updates), you can use the `assignResponse` option.

```js
export const {types, actions, reducers} = createResource({
  name: 'user',
  url: 'https://foo.com/users/:id',
  actions: {
    update: {
      assignResponse: true
    }
  }
});
```
