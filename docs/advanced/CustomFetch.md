# Custom Fetch

You can easily plug in your own fetch library:

```js
import fetch from 'fetch-everywhere';
import {defaultGlobals as reduxRestResourceGlobals} from 'redux-rest-resource';
Object.assign(reduxRestResourceGlobals, {fetch});
```
