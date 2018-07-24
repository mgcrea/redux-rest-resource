import {parseResponse} from '../helpers/fetch';
import {parseContentRangeHeader} from '../helpers/util';

const defaultTransformResponsePipeline = [
  res =>
    parseResponse(res).then(body => {
      const transformedResponse = {body, code: res.status};
      // Add support for Content-Range parsing when a partial http code is used
      const isPartialContent = res.status === 206;
      if (isPartialContent) {
        transformedResponse.contentRange = parseContentRangeHeader(res.headers.get('Content-Range'));
      }
      return transformedResponse;
    })
];

export {defaultTransformResponsePipeline}; // eslint-disable-line
