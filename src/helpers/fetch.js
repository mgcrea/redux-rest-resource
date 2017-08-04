/* global fetch */

import {isObject, startsWith} from './util';
import {encodeUriQuery, encodeUriSegment, replaceUrlParamFromUrl, replaceQueryStringParamFromUrl, splitUrlByProtocolAndDomain} from './url';
import {defaultGlobals, defaultHeaders} from './../defaults';

export class HttpError extends Error {
  constructor(statusCode = 500, {body, message = 'HttpError'}) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
    // Http
    this.statusCode = statusCode;
    this.status = statusCode;
    this.body = body;
  }
}

export const buildFetchUrl = ({url, urlParams, context, stripTrailingSlashes = true}) => {
  const [protocolAndDomain, remainderUrl] = splitUrlByProtocolAndDomain(url);
  // Replace urlParams with values from context
  let builtUrl = Object.keys(urlParams).reduce((wipUrl, urlParam) => {
    const urlParamInfo = urlParams[urlParam];
    const contextAsObject = !isObject(context) ? {id: context} : context;
    const value = contextAsObject[urlParam] || ''; // self.defaults[urlParam];
    if (value) {
      const encodedValue = urlParamInfo.isQueryParamValue ? encodeUriQuery(value, true) : encodeUriSegment(value);
      return replaceUrlParamFromUrl(wipUrl, urlParam, encodedValue);
    }
    return replaceUrlParamFromUrl(wipUrl, urlParam);
  }, remainderUrl);
  // Strip trailing slashes and set the url (unless this behavior is specifically disabled)
  if (stripTrailingSlashes) {
    builtUrl = builtUrl.replace(/\/+$/, '') || '/';
  }
  return protocolAndDomain + builtUrl;
};

export const buildFetchOpts = ({context, contextOpts, actionOpts}) => {
  const opts = {
    headers: defaultHeaders
  };
  if (actionOpts.method) {
    opts.method = actionOpts.method;
  }
  if (actionOpts.headers) {
    opts.headers = {...opts.headers, ...actionOpts.headers};
  }
  if (actionOpts.credentials) {
    opts.credentials = actionOpts.credentials;
  }
  if (contextOpts.query) {
    opts.query = contextOpts.query;
  }
  const hasBody = /^(POST|PUT|PATCH)$/i.test(opts.method);
  if (context && hasBody) {
    opts.body = JSON.stringify(context);
  }
  return opts;
};

export const fetch = (url, options = {}) => {
  // Support options.query
  const builtUrl = Object.keys(options.query || []).reduce((wipUrl, queryParam) => {
    const queryParamValue = options.query[queryParam];
    return replaceQueryStringParamFromUrl(wipUrl, queryParam, queryParamValue);
  }, url);
  return (options.Promise || defaultGlobals.Promise).resolve((defaultGlobals.fetch || fetch)(builtUrl, options))
    .then((res) => {
      if (!res.ok) {
        const contentType = res.headers.get('Content-Type');
        const isJson = startsWith(contentType, 'application/json');
        return res[isJson ? 'json' : 'text']().then((body) => {
          throw new HttpError(res.status, {body});
        });
      }
      return res;
    });
};

export default fetch;
