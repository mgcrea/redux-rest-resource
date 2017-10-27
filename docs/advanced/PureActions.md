# Pure Actions

You can create pure actions that won't perform any HTTP request and only impact the state.

- You can configure pure actions with the `isPure` option, a `reduce` option must be set:

```js
const url = 'https://foo.com/users/:id';
export const {types, actions, reducers} = createResource({
  name: 'user',
  url,
  actions: {
    clear: {isPure: true, reduce: (state, action) => ({...state, item: null})}
  }
});
```

- It will generate the following action creators:

```js
// Action creators available to interact with your REST resource
Object.keys(actions) == [
  "clearUser"
]
```

- That will always run your custom reducer

```js
state == {
  item: null
};
```
