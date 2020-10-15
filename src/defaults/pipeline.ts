import {SerializableResponse} from '../helpers/fetch';
import {parseContentRangeHeader, toString} from '../helpers/util';

const defaultTransformResponsePipeline = [
  // Default plugin to parse headers['Content-Range']
  async (res: SerializableResponse): Promise<SerializableResponse> => {
    const {status, headers} = res;
    const isPartialContent = status === 206;
    if (isPartialContent) {
      res.contentRange = parseContentRangeHeader(toString(headers['Content-Range']));
    }
    return res;
  }
];

export {defaultTransformResponsePipeline};
