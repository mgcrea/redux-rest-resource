# [Redux Rest Resource](http://mgcrea.github.io/redux-rest-resource)

[![npm version](https://img.shields.io/npm/v/redux-rest-resource.svg)](https://github.com/mgcrea/redux-rest-resource/releases) [![license](https://img.shields.io/github/license/mgcrea/redux-rest-resource.svg?style=flat)](https://tldrlegal.com/license/mit-license) [![build status](http://img.shields.io/travis/mgcrea/redux-rest-resource/master.svg?style=flat)](http://travis-ci.org/mgcrea/redux-rest-resource) [![dependencies status](https://img.shields.io/david/mgcrea/redux-rest-resource.svg?style=flat)](https://david-dm.org/mgcrea/redux-rest-resource) [![devDependencies status](https://img.shields.io/david/dev/mgcrea/redux-rest-resource.svg?style=flat)](https://david-dm.org/mgcrea/redux-rest-resource#info=devDependencies) [![coverage status](http://img.shields.io/codeclimate/coverage/github/mgcrea/redux-rest-resource.svg?style=flat)](https://codeclimate.com/github/mgcrea/redux-rest-resource) [![climate status](https://img.shields.io/codeclimate/github/mgcrea/redux-rest-resource.svg?style=flat)](https://codeclimate.com/github/mgcrea/redux-rest-resource)

Dead simple and ready-to-use store module for handling HTTP REST resources.

Generates types, actions and reducers for you to easily interact with any REST API.

Saves you from writing a lot of boilerplate code and ensures that your code stays [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself).

- Relies on [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch) to perform HTTP requests.

- Requires [redux-thunk](https://github.com/gaearon/redux-thunk) to handle async actions.

## Usage

### Quickstart

```bash
npm i redux-rest-resource --save
```

1. Export created types, actions and reducers (eg. in `containers/Users/store/index.js`)

    ```js
    import {createResource} from 'redux-rest-resource';

    const hostUrl = 'https://api.mlab.com:443/api/1/databases/sandbox/collections';
    const apiKey = 'xvDjirE9MCIi800xMxi4EKeTm8e9FUBR';

    export const {types, actions, reducers} = createResource({
      name: 'user',
      url: `${hostUrl}/users/:id?apiKey=${apiKey}`
    });
    ```

2. Import reducers in your store

    ```js
    import {combineReducers} from 'redux';
    import {reducers as usersReducers} from 'containers/Users/store';
    export default combineReducers({
      users: usersReducers
    });
    ```

3. Use provided actions inside connected components

    ```js
    import {bindActionCreators} from 'redux';
    import {connect} from 'react-redux';
    import {actions as userActions} from 'containers/Users/store';
    import UserListItem from './UserListItem';

    class UserList extends Component {

      componentDidMount() {
        const {actions} = this.props;
        actions.fetchUsers();
      }

      render() {
        const {actions, users} = this.props;
        return (
          <ul>
            {users.map(user => <UserListItem key={user.id} user={user} {...actions} />)}
          </ul>
        );
      }

    }

    export default connect(
      // mapStateToProps
      state => ({users: state.users.items}),
      // mapDispatchToProps
      dispatch => ({
        actions: bindActionCreators({...userActions}, dispatch)
      })
    )(UserList);
    ```

### Examples

#### Exported types

```js
types == {
  "CREATE_USER": "@@resource/USER/CREATE",
  "FETCH_USERS": "@@resource/USER/FETCH",
  "GET_USER":    "@@resource/USER/GET",
  "UPDATE_USER": "@@resource/USER/UPDATE",
  "DELETE_USER": "@@resource/USER/DELETE"
}
```

#### Exported action creators

```js
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
// first
{type: '@@resource/USER/FETCH', status: 'pending', context}
// then
{type: '@@resource/USER/FETCH', status: 'resolved', context, body, receivedAt}
// or (catch)
{type: '@@resource/USER/FETCH', status: 'rejected', context, err, receivedAt}
```

> You can find more information in [src/actions](src/actions/index.js)

#### Exported store state from reducer

```js
import {initialState} from 'redux-rest-resource';

initialState == {
  // FETCH props
  items: [],
  isFetching: false,
  lastUpdated: 0,
  didInvalidate: true,
  // GET props
  item: null,
  isFetchingItem: false,
  lastUpdatedItem: 0,
  didInvalidateItem: true,
  // CREATE props
  isCreating: false,
  // UPDATE props
  isUpdating: false,
  // DELETE props
  isDeleting: false
};
```

### Options

| **Option** | **Type** | **Description** |
|------------|----------|-----------------|
| name | String | Actual name of the resource (required) |
| url | Function/String | Actual url of the resource (required) |
| pluralName | String | Plural name of the resource (optional) |
| actions | Object | Action extra options, merged with defaults (optional) |
| credentials | String | Credentials option according to Fetch polyfill doc for sending cookies (optional) |

#### Default actions options

| **Option** | **Type** | **Description** |
|------------|----------|-----------------|
| method | Function/String | Method used by fetch (required) |
| headers | Function/Object | Custom request headers (optional) |
| isArray | Function/Boolean | Whether we should expect an returned Array (optional) |
| transformResponse | Function/Array | Transform returned response (optional) |

```js
import {defaultActions} from 'redux-rest-resource';

defaultActions == {
  "create": {
    "method": "POST"
  },
  "fetch": {
    "method": "GET",
    "isArray": true
  },
  "get": {
    "method": "GET"
  },
  "update": {
    "method": "PATCH"
  },
  "delete": {
    "method": "DELETE"
  }
}

import {defaultHeaders} from 'redux-rest-resource';

defaultHeaders == {
  "Accept": "application/json",
  "Content-Type": "application/json"
}

```


### Advanced Usage

- You can add/override headers for a single action

```js
import {createResource} from 'redux-rest-resource';

const hostUrl = 'https://api.mlab.com:443/api/1/databases/sandbox/collections';
const jwt = 'xvDjirE9MCIi800xMxi4EKeTm8e9FUBR';

export const {types, actions, reducers} = createResource({
  name: 'user',
  url: `${hostUrl}/users/:id?apiKey=${apiKey}`,
  headers: {
    fetch: {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    }
  }
});
```

- Or globally for all actions

```js
import {defaultHeaders} from 'redux-rest-resource';
const jwt = 'xvDjirE9MCIi800xMxi4EKeTm8e9FUBR';
Object.assign(defaultHeaders, {Authorization: `Bearer ${jwt}`});
```

- You can combine multiple resources (ie. for handling children stores):

```js
import {createResource, mergeReducers} from 'redux-rest-resource';

const hostUrl = 'http://localhost:3000';
const libraryResource = createResource({
  name: 'library',
  pluralName: 'libraries',
  url: `${hostUrl}/libraries/:id`
});
const libraryAssetResource = createResource({
  name: 'libraryAsset',
  url: `${hostUrl}/libraries/:libraryId/assets/:id`
});

const types = {...libraryResource.types, ...libraryAssetResource.types};
const actions = {...libraryResource.actions, ...libraryAssetResource.actions};
const reducers = mergeReducers(libraryResource.reducers, {assets: libraryAssetResource.reducers});
export {types, actions, reducers};
```

### Roadmap

- Freeze API after beta feedback
- Maybe support different naming strategies (types and actions)
- Allow store layout customization (reducers)
- Support optimistic updates

### Available scripts

| **Script** | **Description** |
|----------|-------|
| test | Run mocha unit tests |
| lint | Run eslint static tests |
| test:watch | Run and watch mocha unit tests |
| compile | Compile the library |


## Authors

**Olivier Louvignes**

+ http://olouv.com
+ http://github.com/mgcrea

Inspired by the [AngularJS resource](https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js).

## License

```
The MIT License

Copyright (c) 2016 Olivier Louvignes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
