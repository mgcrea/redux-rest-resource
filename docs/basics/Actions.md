# Actions

**Actions** are payloads of information that send data from your application to your store.

**Action creators** are functions that create actions. It's easy to conflate the terms “action” and “action creator,” so do your best to use the proper term.

## Provided action creators

**Redux REST Resource** gives you ready-to-use action creators that will dispatch associated actions. Out of the box, you have the following actions configured:

```js
const {types, actions, reducers} = createResource({name: 'user', url: 'localhost:9000/api'});

Object.keys(actions) ==
  ['createUser', 'fetchUsers', 'getUser', 'updateUser', 'updateUsers', 'deleteUser', 'deleteUsers'];
```

> You can check the [default actions configuration](../defaults/DefaultActions.html)

## Available options

You can configure/override actions actions when using `createResource`:

Every configuration can be specified at either a global level:

```js
createResource({
  name: 'user',
  url: `foo.com/users/:id`,
  headers: {Authorization: 'Bearer foobar'}
});
```

Or at the action level:

```js
createResource({
  name: 'user',
  url: `foo.com/users/:id`,
  actions: {
    update: {
      method: 'POST'
    }
  }
});
```

#### Fetch related options

| Option name   | Type                | Default    | Description              | Example                         |
| ------------- | ------------------- | ---------- | ------------------------ | ------------------------------- |
| `url`         | _String / Function_ | _Required_ | Base URL to fetch        | `"https://foo.com/users/:id"`   |
| `method`      | _String / Function_ | `"GET"`    | HTTP method              | `"PATCH"`                       |
| `headers`     | _Object / Function_ | {}         | Headers to be sent along | `{Authorization: 'Bearer foo'}` |
| `query`       | _Object / Function_ | {}         | Query params             | `{from: 10, until: 20}`         |
| `credentials` | _String / Function_ | undefined  | Credentials              | `"include"`                     |
| `body`        | _String / Function_ | undefined  | HTTP body override       | `{foo: 'bar'}`                  |

Every option also accept a function that will receive the `getState` helper, to act against the current state.

```js
export const {types, actions, reducers} = createResource({
  name: 'user',
  url: `foo.com/users/:id`,
  actions: {
    update: {
      method: (getState, {actionId, context, contextOpts}) => 'POST'
    }
  }
});
```

Every option can also be used at action call-time:

```js
export const {types, actions, reducers} = createResource({
  name: 'user',
  url: `foo.com/users/:id`
});
actions.updateUser(
  {
    id: '5925b7f7d9808600076ce557',
    firstName: 'Olivier'
  },
  {
    query: {
      foo: 'bar'
    },
    credentials: 'include'
  }
);
```

#### Reduce related options

| Option name      | Type      | Default | Description                               |
| ---------------- | --------- | ------- | ----------------------------------------- |
| `isArray`        | _Boolean_ | false   | Whether the expected response is an Array |
| `assignResponse` | _Boolean_ | false   | Whether to assign the response            |
| `isPure`         | _Boolean_ | false   | Whether to skip the HTTP request          |

### Dispatched actions

We're using a dedicated `status` field in our actions to reflect the Promise state.

For instance, `fetchUsers()` will dispatch the following actions:

```js
// Dispatched actions by the `fetchUsers` action creator
// First a `pending` action is dispatched
{type: '@@resource/USER/FETCH', status: 'pending', context}
// then either a `resolved` action on success
{type: '@@resource/USER/FETCH', status: 'resolved', context, options, body, receivedAt, headers}
// or a `rejected` action if an error is caught
{type: '@@resource/USER/FETCH', status: 'rejected', context, options, err, receivedAt}
```

Every REST action creator will dispatch at most two actions based on the async status of the request.
