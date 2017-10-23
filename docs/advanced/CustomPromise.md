# Custom Promise

You can easily plug in your own Promise library:

```js
import Promise from 'bluebird';
import {defaultGlobals as reduxRestResourceGlobals} from 'redux-rest-resource';
Object.assign(reduxRestResourceGlobals, {Promise});
```
