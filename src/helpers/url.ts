// https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js#L473

const PROTOCOL_AND_DOMAIN_REGEX = /^https?:\/\/[^/]*/;
const NUMBER_REGEX = /^[0-9]+$/;

/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a
 * custom method because encodeURIComponent is too aggressive and encodes stuff that doesn't
 * have to be encoded per http://tools.ietf.org/html/rfc3986
 */
export const encodeUriQuery = (val: string, pctEncodeSpaces: boolean): string =>
  encodeURIComponent(val)
    .replace(/%40/gi, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, pctEncodeSpaces ? '%20' : '+');

/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set
 * (pchar) allowed in path segments
 */
export const encodeUriSegment = (val: string): string =>
  encodeUriQuery(val, true).replace(/%26/gi, '&').replace(/%3D/gi, '=').replace(/%2B/gi, '+');

export const parseUrlParams = (url: string): Record<string, {isQueryParamValue?: boolean}> =>
  url.split(/\W/).reduce<Record<string, {isQueryParamValue?: boolean}>>((urlParams, param) => {
    if (!NUMBER_REGEX.test(param) && param && new RegExp(`(^|[^\\\\]):${param}(\\W|$)`).test(url)) {
      urlParams[param] = {
        // eslint-disable-line no-param-reassign
        isQueryParamValue: new RegExp(`\\?.*=:${param}(?:\\W|$)`).test(url)
      };
    }
    return urlParams;
  }, {});

export const replaceUrlParamFromUrl = (url: string, urlParam: string, replace = ''): string =>
  url.replace(
    new RegExp(`(/?):${urlParam}(\\W|$)`, 'g'),
    (_match, leadingSlashes, tail) => (replace ? leadingSlashes : '') + replace + tail
  );

export const replaceQueryStringParamFromUrl = (url: string, key: string, value: string): string => {
  const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
  const sep = url.indexOf('?') !== -1 ? '&' : '?';
  return url.match(re) ? url.replace(re, `$1${key}=${value}$2`) : `${url}${sep}${key}=${value}`;
};

export const splitUrlByProtocolAndDomain = (url: string): [string, string] => {
  let protocolAndDomain = '';
  const remainderUrl = url.replace(PROTOCOL_AND_DOMAIN_REGEX, (match) => {
    protocolAndDomain = match;
    return '';
  });
  return [protocolAndDomain, remainderUrl];
};
