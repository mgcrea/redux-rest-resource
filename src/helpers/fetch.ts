import {defaultGlobals, defaultHeaders, defaultIdKeys} from '../defaults';
import {Context} from '../typings/index';
import {
  encodeUriQuery,
  encodeUriSegment,
  replaceQueryStringParamFromUrl,
  replaceUrlParamFromUrl,
  splitUrlByProtocolAndDomain
} from './url';
import {endsWith, isObject, isString, startsWith, toString} from './util';

export class HttpError extends Error {
  statusCode: number;
  status: number;
  body: unknown;
  constructor(statusCode = 500, {body, message = 'HttpError'}: {body?: unknown; message?: string}) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
    // Http
    this.statusCode = statusCode;
    this.status = statusCode;
    this.body = body;
  }
}

type BuildFetchUrlOptions = {
  url: string;
  urlParams: Record<string, {isQueryParamValue?: boolean}>;
  stripTrailingSlashes?: boolean;
};
export const buildFetchUrl = (
  context: Context,
  {url, urlParams, stripTrailingSlashes = true}: BuildFetchUrlOptions
): string => {
  const [protocolAndDomain = '', remainderUrl] = splitUrlByProtocolAndDomain(url);
  // Replace urlParams with values from context
  let builtUrl = Object.keys(urlParams).reduce((wipUrl, urlParam) => {
    const urlParamInfo = urlParams[urlParam];
    const contextAsObject = !isObject(context)
      ? {
          [defaultIdKeys.singular]: context
        }
      : context;
    const value = contextAsObject[urlParam] || ''; // self.defaults[urlParam];
    if (value) {
      const encodedValue = urlParamInfo.isQueryParamValue
        ? encodeUriQuery(toString(value), true)
        : encodeUriSegment(toString(value));
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

type FetchOptions = RequestInit & {
  query?: Record<string, unknown>;
  Promise?: PromiseConstructor;
};

export const buildFetchOpts = (
  context: Context,
  {method, headers, credentials, query, body}: FetchOptions
): FetchOptions => {
  const opts: FetchOptions = {
    method: 'GET',
    headers: defaultHeaders
  };
  if (method) {
    opts.method = method;
  }
  if (headers) {
    opts.headers = {
      ...opts.headers,
      ...headers
    };
  }
  if (credentials) {
    opts.credentials = credentials;
  }
  if (query) {
    opts.query = query;
  }
  const hasBody = /^(POST|PUT|PATCH|DELETE)$/i.test(opts.method as string);
  if (body) {
    opts.body = isString(body) ? body : JSON.stringify(body);
  } else if (hasBody && context) {
    const contextAsObject = !isObject(context)
      ? {
          [defaultIdKeys.singular]: context
        }
      : context;
    opts.body = JSON.stringify(contextAsObject);
  }
  return opts;
};

export const parseResponse = (res: Response): Promise<unknown> => {
  const contentType = res.headers.get('Content-Type');
  // @NOTE parses 'application/problem+json; charset=utf-8' for example
  // see https://tools.ietf.org/html/rfc6839
  const isJson =
    contentType && (startsWith(contentType, 'application/json') || endsWith(contentType.split(';')[0], '+json'));
  return res[isJson ? 'json' : 'text']();
};

const fetch = async (url: string, options: FetchOptions = {}): Promise<Response> => {
  // Support options.query
  const query = isObject(options.query) ? options.query : {};
  const builtUrl = Object.keys(query).reduce((wipUrl, queryParam) => {
    const queryParamValue: string = isString(query[queryParam])
      ? (query[queryParam] as string)
      : JSON.stringify(query[queryParam]);
    return replaceQueryStringParamFromUrl(wipUrl, queryParam, queryParamValue);
  }, url);
  return (options.Promise || defaultGlobals.Promise)
    .resolve((defaultGlobals.fetch || fetch)(builtUrl, options))
    .then((res) => {
      if (!res.ok) {
        return parseResponse(res).then((body) => {
          throw new HttpError(res.status, {
            body
          });
        });
      }
      return res;
    });
};

export default fetch;
