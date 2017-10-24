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

- It will generate the following action creators:

```js
// Action creators available to interact with your REST resource
Object.keys(actions) == [
  "runUser",
  "mergeUsers"
]
```

- And have the following state by default:

```js
state == {
  isRunning: false,
  isMerging: false
};
```
