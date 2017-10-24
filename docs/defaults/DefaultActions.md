# Default Actions

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
```
