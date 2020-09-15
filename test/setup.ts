import 'cross-fetch/polyfill';
import {warn} from 'console';
import {inspect} from 'util';

declare global {
  namespace NodeJS {
    interface Global {
      d: Console['warn'];
      dd: Console['warn'];
    }
  }
}

global.d = (...args: unknown[]) => warn(inspect(args.length > 1 ? args : args[0], {colors: true, depth: 10}));
global.dd = (...args: unknown[]) => {
  global.d(...args);
  expect(1).toEqual(2);
};
