# Custom Actions

- You can configure custom actions:

```js
const url = 'https://foo.com/users/:id';
export const {types, actions, reducers} = createResource({
  name: 'user',
  url,
  actions: {
    run: {method: 'POST', gerundName: 'running', url: `${url}/run`},
    merge: {method: 'POST', isArray: true}
  }
});
```
