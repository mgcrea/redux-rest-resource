# Resource Combination

You can easily combine multiple resources together. For instance, if you want to use children resources attached to a parent store node:

```js
import {createResource} from 'redux-rest-resource';
const hostUrl = 'http://localhost:3000';
// Parent Library Store
const libraryResource = createResource({
  name: 'library',
  pluralName: 'libraries',
  url: `${hostUrl}/libraries/:id`
});
// Children Library Asset Store
const libraryAssetResource = createResource({
  name: 'libraryAsset',
  url: `${hostUrl}/libraries/:libraryId/assets/:id`
});
```

Exported `types` and `actions` do expose unique keys that enables quick and easy merging.

```js
const types = {...libraryResource.types, ...libraryAssetResource.types};
const actions = {...libraryResource.actions, ...libraryAssetResource.actions};
```

Reducers do require extra care:

```js
import {mergeReducers} from 'redux-rest-resource';
const reducers = mergeReducers(libraryResource.reducers, {assets: libraryAssetResource.reducers});
```

Finally export an unified resource:

```js
export {types, actions, reducers};
```
