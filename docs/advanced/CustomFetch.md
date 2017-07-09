# Custom Fetch

You can easily plug in your own fetch library:

```js
import fetch from 'fetch-everywhere';
import {defaultGlobals} from 'redux-rest-resource';
Object.assign(defaultGlobals, {fetch});
```
