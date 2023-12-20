/**
 * Grab bag of utility functions used across the code.
 */
import type {
  TextDecoder as TextDecoderType,
  TextEncoder as TextEncoderType,
} from 'node:util';

import { ApiError, ErrorCode } from './ApiError';
import type { Cred } from './cred';
import * as path from './emulation/path';
import type { FileSystem } from './filesystem';
import type { BaseProviderConstructor } from './providers/provider';

declare const globalThis: {
  TextEncoder: typeof TextEncoderType;
  TextDecoder: typeof TextDecoderType;
  setImmediate?: (callback: () => unknown) => void;
};

/**
 * Synchronous recursive makedir.
 * @internal
 */
export function mkdirpSync(
  p: string,
  mode: number,
  cred: Cred,
  fs: FileSystem,
): void {
  if (!fs.existsSync(p, cred)) {
    mkdirpSync(path.dirname(p), mode, cred, fs);
    fs.mkdirSync(p, mode, cred);
  }
}

/*
 * Levenshtein distance, from the `js-levenshtein` NPM module.
 * Copied here to avoid complexity of adding another CommonJS module dependency.
 */

function _min(
  d0: number,
  d1: number,
  d2: number,
  bx: number,
  ay: number,
): number {
  return Math.min(d0 + 1, d1 + 1, d2 + 1, bx === ay ? d1 : d1 + 1);
}

/**
 * Calculates levenshtein distance.
 * @param a
 * @param b
 */
function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (a.length > b.length) {
    [a, b] = [b, a]; // Swap a and b
  }

  let la = a.length;
  let lb = b.length;

  // Trim common suffix
  while (la > 0 && a.charCodeAt(la - 1) === b.charCodeAt(lb - 1)) {
    la--;
    lb--;
  }

  let offset = 0;

  // Trim common prefix
  while (offset < la && a.charCodeAt(offset) === b.charCodeAt(offset)) {
    offset++;
  }

  la -= offset;
  lb -= offset;

  if (la === 0 || lb === 1) {
    return lb;
  }

  const vector = new Array<number>(la << 1);

  for (let y = 0; y < la; ) {
    vector[la + y] = a.charCodeAt(offset + y);
    vector[y] = ++y;
  }

  let x: number;
  let d0: number;
  let d1: number;
  let d2: number;
  let d3: number;
  for (x = 0; x + 3 < lb; ) {
    const bx0 = b.charCodeAt(offset + (d0 = x));
    const bx1 = b.charCodeAt(offset + (d1 = x + 1));
    const bx2 = b.charCodeAt(offset + (d2 = x + 2));
    const bx3 = b.charCodeAt(offset + (d3 = x + 3));
    let dd = (x += 4);
    for (let y = 0; y < la; ) {
      const ay = vector[la + y];
      const dy = vector[y];
      d0 = _min(dy, d0, d1, bx0, ay);
      d1 = _min(d0, d1, d2, bx1, ay);
      d2 = _min(d1, d2, d3, bx2, ay);
      dd = _min(d2, d3, dd, bx3, ay);
      vector[y++] = dd;
      d3 = d2;
      d2 = d1;
      d1 = d0;
      d0 = dy;
    }
  }

  let dd: number = 0;
  for (; x < lb; ) {
    const bx0 = b.charCodeAt(offset + (d0 = x));
    dd = ++x;
    for (let y = 0; y < la; y++) {
      const dy = vector[y];
      vector[y] = dd =
        dy < d0 || dd < d0
          ? dy > dd
            ? dd + 1
            : dy + 1
          : bx0 === vector[la + y]
            ? d0
            : d0 + 1;
      d0 = dy;
    }
  }

  return dd;
}

/**
 * Checks that the given options object is valid for the file system options.
 * @internal
 */
export async function checkOptions(
  provider: BaseProviderConstructor,
  opts: object,
): Promise<void> {
  const optsInfo = provider.Options;
  const fsName = provider.Name;

  let pendingValidators = 0;
  let callbackCalled = false;
  let loopEnded = false;

  // Check for required options.
  for (const optName in optsInfo) {
    if (Object.prototype.hasOwnProperty.call(optsInfo, optName)) {
      const opt = optsInfo[optName];
      const providedValue = opts && opts[optName];

      if (providedValue === undefined || providedValue === null) {
        if (!opt.optional) {
          // Required option, not provided.
          // Any incorrect options provided? Which ones are close to the provided one?
          // (edit distance 5 === close)
          const incorrectOptions = Object.keys(opts)
            .filter((o) => !(o in optsInfo))
            .map((a: string) => {
              return { str: a, distance: levenshtein(optName, a) };
            })
            .filter((o) => o.distance < 5)
            .sort((a, b) => a.distance - b.distance);
          // Validators may be synchronous.
          if (callbackCalled) {
            return;
          }
          callbackCalled = true;
          throw new ApiError(
            ErrorCode.EINVAL,
            `[${fsName}] Required option '${optName}' not provided.${
              incorrectOptions.length > 0
                ? ` You provided unrecognized option '${incorrectOptions[0].str}'; perhaps you meant to type '${optName}'.`
                : ''
            }\nOption description: ${opt.description}`,
          );
        }
        // Else: Optional option, not provided. That is OK.
      } else {
        // Option provided! Check type.
        let typeMatches = false;
        if (Array.isArray(opt.type)) {
          typeMatches = opt.type.indexOf(typeof providedValue) !== -1;
        } else {
          typeMatches = typeof providedValue === opt.type;
        }
        if (!typeMatches) {
          // Validators may be synchronous.
          if (callbackCalled) {
            return;
          }
          callbackCalled = true;
          throw new ApiError(
            ErrorCode.EINVAL,
            `[${fsName}] Value provided for option ${optName} is not the proper type. Expected ${
              Array.isArray(opt.type)
                ? `one of {${opt.type.join(', ')}}`
                : opt.type
            }, but received ${typeof providedValue}\nOption description: ${
              opt.description
            }`,
          );
        } else if (opt.validator) {
          pendingValidators++;
          try {
            await opt.validator(providedValue);
          } catch (e) {
            if (!callbackCalled) {
              if (e) {
                callbackCalled = true;
                throw e;
              }
              pendingValidators--;
              if (pendingValidators === 0 && loopEnded) {
                return;
              }
            }
          }
        }
        // Otherwise: All good!
      }
    }
  }
  loopEnded = true;
  if (pendingValidators === 0 && !callbackCalled) {
    return;
  }
}

/** Waits n ms.  */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Converts a callback into a promise. Assumes last parameter is the callback
 * @todo Look at changing resolve value from cbArgs[0] to include other callback arguments?
 */
export function toPromise(fn: (...fnArgs: unknown[]) => unknown) {
  return function (...args: unknown[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
      args.push((e: ApiError, ...cbArgs: unknown[]) => {
        if (e) {
          reject(e);
        } else {
          resolve(cbArgs[0]);
        }
      });
      fn(...args);
    });
  };
}

/**
 * @internal
 */
export const setImmediate =
  typeof globalThis.setImmediate == 'function'
    ? globalThis.setImmediate
    : (cb) => setTimeout(cb, 0);

/**
 * @internal
 */
export const ROOT_NODE_ID: string = '/';

const textEncoder = new globalThis.TextEncoder();
export const encode: typeof textEncoder.encode =
  textEncoder.encode.bind(textEncoder);
const textDecoder = new globalThis.TextDecoder();
export const decode: typeof textDecoder.decode =
  textDecoder.decode.bind(textDecoder);

/**
 * Generates a random ID.
 * @internal
 */
export function randomUUID(): string {
  // From https://stackoverflow.com/a/8809472/13939182
  // Public Domain/MIT
  let d = new Date().getTime(); //Timestamp
  let d2 =
    (typeof performance !== 'undefined' &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
