# Redux Rest Resource

[![project status](https://img.shields.io/badge/status-beta-blue.svg?style=flat)](https://github.com/mgcrea/redux-rest-resource) [![license](https://img.shields.io/github/license/mgcrea/redux-rest-resource.svg?style=flat)](https://tldrlegal.com/license/mit-license) [![build status](http://img.shields.io/travis/mgcrea/redux-rest-resource/master.svg?style=flat)](http://travis-ci.org/mgcrea/redux-rest-resource) [![dependencies status](https://img.shields.io/david/mgcrea/redux-rest-resource.svg?style=flat)](https://david-dm.org/mgcrea/redux-rest-resource) [![devDependencies status](https://img.shields.io/david/dev/mgcrea/redux-rest-resource.svg?style=flat)](https://david-dm.org/mgcrea/redux-rest-resource#info=devDependencies) [![coverage status](http://img.shields.io/codeclimate/coverage/github/mgcrea/redux-rest-resource.svg?style=flat)](https://codeclimate.com/github/mgcrea/redux-rest-resource) [![climate status](https://img.shields.io/codeclimate/github/mgcrea/redux-rest-resource.svg?style=flat)](https://codeclimate.com/github/mgcrea/redux-rest-resource)

Redux REST resource does generate types, actions and reducers to easily interact with a REST API.

Relies on `isomorphic-fetch` to perform HTTP requests.

## Usage

### Quickstart

1. Export created types, actions and reducers (eg. in `containers/Users/store/index.js`)

    ```js
    import {createResource} from 'redux-rest-resource';

    const hostUrl = 'https://api.mlab.com:443/api/1/databases/sandbox/collections';
    const apiKey = 'yvDjirE9MCIi800xMxi9EKETm8e9FUBR';

    export const {types, actions, reducers} = createResource({
      name: 'user',
      url: `${hostUrl}/users/:id?apiKey=${apiKey}`
    });
    ```

2. Import reducers in your store

    ```js
    import {combineReducers} from 'redux';
    import {reducers as userReducers} from 'containers/Users/store';
    export default combineReducers({
      users: userReducers
    });
    ```

3. Enjoy actions inside connected components!

    ```js
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
      state => ({users: state.users}),
      // mapDispatchToProps
      dispatch => ({
        actions: bindActionCreators({...userActions}, dispatch)
      })
    )(UserList);
    ```

#### Exported types

```js
types = {
  "CREATE_USER": "@@resource/USER/CREATE",
  "FETCH_USERS": "@@resource/USER/FETCH",
  "GET_USER": "@@resource/USER/GET",
  "UPDATE_USER": "@@resource/USER/UPDATE",
  "DELETE_USER": "@@resource/USER/DELETE"
}
```

#### Exported actions

```js
Object.keys(actions) = [
  "createUser",
  "fetchUsers",
  "getUser",
  "updateUser",
  "deleteUser"
]
```


### Options

| **Option** | **Type** | **Description** |
|------------|----------|-----------------|
| name | String | Actual name of the resource (required) |
| pluralName | String | Plural name of the resource (optional) |
| url | String | Actual url of the resource (required) |
| actions | Object | Action extra options, merged with defaults (optional) |

#### Default actions options

| **Option** | **Type** | **Description** |
|------------|----------|-----------------|
| method | String | Method used by fetch (required) |
| isArray | Boolean | Whether we should expect an returned Array (optional) |
| transformResponse | Function/Array | Transform returned response (required) |

```js
import {defaultActions} from 'redux-rest-resource/lib/defaults';

defaultActions = {
  "create": {
    "method": "post",
    "alias": "save"
  },
  "fetch": {
    "method": "get",
    "isArray": true
  },
  "get": {
    "method": "get"
  },
  "update": {
    "method": "patch"
  },
  "delete": {
    "method": "delete"
  }
}
```


### Advanced Usage

- You can easily combine multiple resources:

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
- Maybe support different naming strategies
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
