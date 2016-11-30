# Custom Promise

You can easily plug in your own Promise library:

```js
import Promise from 'bluebird';
import {defaultGlobals} from 'redux-rest-resource';
Object.assign(defaultGlobals, {Promise});
```
