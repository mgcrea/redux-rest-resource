# [Redux Rest Resource](http://mgcrea.github.io/redux-rest-resource)

[![npm version](https://img.shields.io/npm/v/redux-rest-resource.svg)](https://github.com/mgcrea/redux-rest-resource/releases)
[![license](https://img.shields.io/github/license/mgcrea/redux-rest-resource.svg?style=flat)](https://tldrlegal.com/license/mit-license)
[![build status](http://img.shields.io/travis/mgcrea/redux-rest-resource/master.svg?style=flat)](http://travis-ci.org/mgcrea/redux-rest-resource)
[![dependencies status](https://img.shields.io/david/mgcrea/redux-rest-resource.svg?style=flat)](https://david-dm.org/mgcrea/redux-rest-resource)
[![devDependencies status](https://img.shields.io/david/dev/mgcrea/redux-rest-resource.svg?style=flat)](https://david-dm.org/mgcrea/redux-rest-resource#info=devDependencies)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/fdbf36d00e5d49c4879b91920e3e9b08)](https://www.codacy.com/app/mgcrea/redux-rest-resource?utm_source=github.com&utm_medium=referral&utm_content=mgcrea/redux-rest-resource&utm_campaign=Badge_Coverage)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/fdbf36d00e5d49c4879b91920e3e9b08)](https://www.codacy.com/app/mgcrea/redux-rest-resource?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=mgcrea/redux-rest-resource&amp;utm_campaign=Badge_Grade)

Dead simple and ready-to-use store module for handling HTTP REST resources.

Generates types, actions and reducers for you to easily interact with any REST API.

Saves you from writing a lot of boilerplate code and ensures that your code stays [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself).

- Requires [redux-thunk](https://github.com/gaearon/redux-thunk) to handle async actions.

- Relies on [fetch](https://fetch.spec.whatwg.org/) to perform HTTP requests.

> NOTE: If you want to use this in environments without a builtin `fetch` implementation, you need to [bring your own custom fetch polyfill](advanced/CustomFetch).

## [Quickstart](http://mgcrea.github.io/redux-rest-resource/docs/usage/Quickstart.html)

### Available scripts

| **Script**    | **Description**              |
|---------------|------------------------------|
| start         | alias to `test:watch`        |
| test          | Run unit tests               |
| test:watch    | Watch unit tests             |
| test:coverage | Run unit tests with coverage |
| lint          | Run eslint static tests      |
| compile       | Compile the library          |
| compile:watch | Watch compilation            |
| docs          | Serve docs                   |
| docs:compile  | Compile docs                 |

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
