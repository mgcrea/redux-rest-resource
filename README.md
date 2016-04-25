# [Redux Rest Resource](http://mgcrea.github.io/redux-rest-resource)

[![project status](https://img.shields.io/badge/status-beta-blue.svg?style=flat)](https://github.com/mgcrea/redux-rest-resource) [![license](https://img.shields.io/github/license/mgcrea/redux-rest-resource.svg?style=flat)](https://tldrlegal.com/license/mit-license) [![build status](http://img.shields.io/travis/mgcrea/redux-rest-resource/master.svg?style=flat)](http://travis-ci.org/mgcrea/redux-rest-resource) [![dependencies status](https://img.shields.io/david/mgcrea/redux-rest-resource.svg?style=flat)](https://david-dm.org/mgcrea/redux-rest-resource) [![devDependencies status](https://img.shields.io/david/dev/mgcrea/redux-rest-resource.svg?style=flat)](https://david-dm.org/mgcrea/redux-rest-resource#info=devDependencies) [![coverage status](http://img.shields.io/codeclimate/coverage/github/mgcrea/redux-rest-resource.svg?style=flat)](https://codeclimate.com/github/mgcrea/redux-rest-resource) [![climate status](https://img.shields.io/codeclimate/github/mgcrea/redux-rest-resource.svg?style=flat)](https://codeclimate.com/github/mgcrea/redux-rest-resource)

Redux REST resource generates types, actions and reducers for you to easily interact with any REST API.

- Relies on [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch) to perform HTTP requests.

- Requires [redux-thunk](https://github.com/gaearon/redux-thunk) to handle async actions.

## Usage

### Quickstart

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
      state => ({users: state.users}),
      // mapDispatchToProps
      dispatch => ({
        actions: bindActionCreators({...userActions}, dispatch)
      })
    )(UserList);
    ```

### Options

| **Option** | **Type** | **Description** |
|------------|----------|-----------------|
| name | String | Actual name of the resource (required) |
| url | String | Actual url of the resource (required) |
| pluralName | String | Plural name of the resource (optional) |
| actions | Object | Action extra options, merged with defaults (optional) |

#### Default actions options

| **Option** | **Type** | **Description** |
|------------|----------|-----------------|
| method | String | Method used by fetch (required) |
| headers | Object | Custom request headers (optional) |
| isArray | Boolean | Whether we should expect an returned Array (optional) |
| transformResponse | Function/Array | Transform returned response (optional) |

```js
import {defaultActions} from 'redux-rest-resource';

defaultActions == {
  "create": {
    "method": "post"
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

import {defaultHeaders} from 'redux-rest-resource';

defaultHeaders == {
  "Accept": "application/json",
  "Content-Type": "application/json"
}

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
