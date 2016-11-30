// https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js#L473

const PROTOCOL_AND_DOMAIN_REGEX = /^https?:\/\/[^/]*/;
const NUMBER_REGEX = /^\\d+$/;
// const isString = string => typeof string === 'string';
const isObject = object => typeof object === 'object';

/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a
 * custom method because encodeURIComponent is too aggressive and encodes stuff that doesn't
 * have to be encoded per http://tools.ietf.org/html/rfc3986
 */
const encodeUriQuery = (val, pctEncodeSpaces) =>
  encodeURIComponent(val)
    .replace(/%40/gi, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));

/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set
 * (pchar) allowed in path segments
 */
const encodeUriSegment = val =>
  encodeUriQuery(val, true)
    .replace(/%26/gi, '&')
    .replace(/%3D/gi, '=')
    .replace(/%2B/gi, '+');

const parseUrlParams = url =>
  url.split(/\W/).reduce((urlParams, param) => {
    if (!NUMBER_REGEX.test(param) && param && (new RegExp(`(^|[^\\\\]):${param}(\\W|$)`).test(url))) {
      urlParams[param] = { // eslint-disable-line no-param-reassign
        isQueryParamValue: (new RegExp(`\\?.*=:${param}(?:\\W|$)`)).test(url)
      };
    }
    return urlParams;
  }, {});

const replaceUrlParamFromUrl = (url, urlParam, replace = '') =>
  url.replace(new RegExp(`(/?):${urlParam}(\\W|$)`, 'g'), (match, leadingSlashes, tail) =>
    (replace || tail.charAt(0) === '/' ? leadingSlashes : '') + replace + tail
  );

const replaceQueryStringParamFromUrl = (url, key, value) => {
  const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
  const sep = url.indexOf('?') !== -1 ? '&' : '?';
  return url.match(re)
    ? url.replace(re, `$1${key}=${value}$2`)
    : `${url}${sep}${key}=${value}`;
};

const buildFetchUrl = ({url, urlParams, context, contextOpts = {query: []}, stripTrailingSlashes = true}) => {
  let protocolAndDomain;
  let builtUrl = url.replace(PROTOCOL_AND_DOMAIN_REGEX, (match) => {
    protocolAndDomain = match;
    return '';
  });
  // Replace urlParams with values from context
  builtUrl = Object.keys(urlParams).reduce((wipUrl, urlParam) => {
    const urlParamInfo = urlParams[urlParam];
    const contextAsObject = !isObject(context) ? {id: context} : context;
    const value = contextAsObject[urlParam] || ''; // self.defaults[urlParam];
    if (value) {
      const encodedValue = urlParamInfo.isQueryParamValue ? encodeUriQuery(value, true) : encodeUriSegment(value);
      return replaceUrlParamFromUrl(wipUrl, urlParam, encodedValue);
    }
    return replaceUrlParamFromUrl(wipUrl, urlParam);
  }, builtUrl);
  // Strip trailing slashes and set the url (unless this behavior is specifically disabled)
  if (stripTrailingSlashes) {
    builtUrl = builtUrl.replace(/\/+$/, '') || '/';
  }
  // Append any querystring options
  builtUrl = Object.keys(contextOpts.query || []).reduce((wipUrl, queryParam) => {
    const queryParamValue = contextOpts.query[queryParam];
    return replaceQueryStringParamFromUrl(wipUrl, queryParam, queryParamValue);
  }, builtUrl);
  return protocolAndDomain + builtUrl;
};

export {parseUrlParams, buildFetchUrl};
