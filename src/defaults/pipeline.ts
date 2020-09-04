import {SerializableResponse} from '../helpers/fetch';
import {parseContentRangeHeader, toString} from '../helpers/util';

const defaultTransformResponsePipeline = [
  // Default plugin to parse headers['Content-Range']
  async (res: SerializableResponse): Promise<SerializableResponse> => {
    const {payload} = res;
    const isPartialContent = payload.status === 206;
    if (isPartialContent) {
      res.contentRange = parseContentRangeHeader(toString(payload.headers['Content-Range']));
    }
    return res;
  }
];

export {defaultTransformResponsePipeline};
