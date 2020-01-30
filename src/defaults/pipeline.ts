import {parseResponse} from '../helpers/fetch';
import {parseContentRangeHeader, toString} from '../helpers/util';
import {ContentRange} from '../typings';

type DefaultTransformedResponse = {
  body: unknown;
  code: Response['status'];
  contentRange?: ContentRange | null;
};

const defaultTransformResponsePipeline = [
  (res: Response): Promise<DefaultTransformedResponse> =>
    parseResponse(res).then((body) => {
      const transformedResponse: DefaultTransformedResponse = {body, code: res.status};
      // Add support for Content-Range parsing when a partial http code is used
      const isPartialContent = res.status === 206;
      if (isPartialContent) {
        transformedResponse.contentRange = parseContentRangeHeader(toString(res.headers.get('Content-Range')));
      }
      return transformedResponse;
    })
];

export {defaultTransformResponsePipeline};
