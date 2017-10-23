# Actions

**Actions** are payloads of information that send data from your application to your store.

**Action creators** are functions that create actions. It's easy to conflate the terms “action” and “action creator,” so do your best to use the proper term.

#### Defaults action configuration

Out of the box, you have the following actions configured:

```js
const defaultActions = {
  create: {method: 'POST', alias: 'save'},
  fetch: {method: 'GET', isArray: true},
  get: {method: 'GET'},
  update: {method: 'PATCH'},
  delete: {method: 'DELETE'}
};
```

#### Available options

You can configure/override actions actions when using `createResource`:

Every configuration can be specified at either a global level:

```
createResource({
  name: 'user',
  url: `foo.com/users/:id`,
  headers: {Authorization: 'Bearer foobar'}
});
```

Or at the action level:

```
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

##### Fetch related options

| Option name  | Type                | Default    | Description              | Example                         |
|--------------|---------------------|------------|--------------------------|---------------------------------|
| `url`        | *String / Function* | *Required* | Base URL to fetch        | `"https://foo.com/users/:id"`   |
| `method`     | *String / Function* | `"GET"`    | HTTP method              | `"PATCH"`                       |
| `headers`    | *Object / Function* | {}         | Headers to be sent along | `{Authorization: 'Bearer foo'}` |
| `query`      | *Object / Function* | {}         | Query params             | `{from: 10, until: 20}`         |
| `credential` | *String / Function* | undefined  | Credentials              | `"include"`                     |

Every option also accept a function that will receive the `getState` helper, to act against the current state.

- Example:

```js
export const {types, actions, reducers} = createResource({
  name: 'user',
  url: `foo.com/users/:id`,
  actions: {
    update: {
      method: (getState, {actionId}) => 'POST'
    }
  }
});
```

#### Provided action creators

**Redux REST Resource** gives you ready-to-use action creators that will dispatch associated actions

```js
// Action creators available to interact with your REST resource
Object.keys(actions) == [
  "createUser",
  "fetchUsers",
  "getUser",
  "updateUser",
  "deleteUser"
]
```

#### Dispatched actions

We're using a dedicated `status` field in our actions to reflect the Promise state.

Every REST action creator will dispatch at most two actions:

```js
// Dispatched actions by the `fetchUsers` action creator
// First a `pending` action is dispatched
{type: '@@resource/USER/FETCH', status: 'pending', context}
// then either a `resolved` action on success
{type: '@@resource/USER/FETCH', status: 'resolved', context, options, body, receivedAt}
// or a `rejected` action if an error is caught
{type: '@@resource/USER/FETCH', status: 'rejected', context, options, err, receivedAt}
```
