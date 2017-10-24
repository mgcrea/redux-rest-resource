# Actions Examples

- `create`:

```js
const createBody = {firstName: 'Olivier'};
const actionOpts = {query: {foo: 'bar'}};
actions.createUser(createBody, actionOpts);
// Will POST `createBody` to localhost:9000/api/users?foo=bar
```

- `fetch`:

```js
const actionOpts = {query: {foo: 'bar'}};
const fetchContext = null;
// fetchContext could be used as an object to resolve extra url parameters (eg. localhost:9000/api/:version/users/:id)
actions.fetchUsers(fetchContext, actionOpts);
// Will GET localhost:9000/api/users?foo=bar
```

- `update`:

```js
const updateBody = {id: '5925b7f7d9808600076ce557', firstName: 'Olivia'};
const actionOpts = {query: {foo: 'bar'}};
actions.updateUser(updateBody, actionOpts);
// Will PATCH updateBody to localhost:9000/api/users/5925b7f7d9808600076ce557?foo=bar
```

- `get`:

```js
const getContext = {id: '5925b7f7d9808600076ce557'};
// const getContext = '5925b7f7d9808600076ce557' would also work
const actionOpts = {query: {foo: 'bar'}};
actions.getUser(getContext, actionOpts);
// Will GET localhost:9000/api/users/5925b7f7d9808600076ce557?foo=bar
```

- `delete`:

```js
const deleteContext = {id: '5925b7f7d9808600076ce557'};
// const deleteContext = '5925b7f7d9808600076ce557' would also work
const actionOpts = {query: {foo: 'bar'}};
actions.deleteUser(getContext, actionOpts);
// Will DELETE localhost:9000/api/users/5925b7f7d9808600076ce557?foo=bar
```

> For the list of [all available options](../basics/Actions.html#available-options)
