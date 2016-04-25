# Actions

**Actions** are payloads of information that send data from your application to your store.

**Action creators** are functions that create actions. It's easy to conflate the terms “action” and “action creator,” so do your best to use the proper term.

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

Every REST action creator will dispatch two actions, based on the Promise state:

```js
// Dispatched actions by the `fetchUsers` action creator
// First a `pending` action is dispatched
{type: '@@resource/USER/FETCH', status: 'pending', context}
// then either a `resolved` action on success
{type: '@@resource/USER/FETCH', status: 'resolved', context, body, receivedAt}
// or a `rejected` action if an error is caught
{type: '@@resource/USER/FETCH', status: 'rejected', context, err, receivedAt}
```
