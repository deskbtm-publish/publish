import { ApiError, ErrorCode } from './ApiError';

/**
 * Contains utility methods for network I/O (using fetch)
 */

export const fetchIsAvailable = typeof fetch !== 'undefined' && fetch !== null;

/**
 * @hidden
 */
function convertError(e: Error): never {
  throw new ApiError(ErrorCode.EIO, e.message);
}

/**
 * Asynchronously download a file as a buffer or a JSON object.
 * Note that the third function signature with a non-specialized type is
 * invalid, but TypeScript requires it when you specialize string arguments to
 * constants.
 * @hidden
 */
export async function fetchFile(p: string, type: 'buffer'): Promise<Uint8Array>;
export async function fetchFile(p: string, type: 'json'): Promise<any>;
export async function fetchFile(
  p: string,
  type: 'buffer' | 'json',
): Promise<any>;
export async function fetchFile(
  p: string,
  type: 'buffer' | 'json',
): Promise<any> {
  const response = await fetch(p).catch(convertError);
  if (!response.ok) {
    throw new ApiError(
      ErrorCode.EIO,
      `fetch error: response returned code ${response.status}`,
    );
  }
  switch (type) {
    case 'buffer':
      const arrayBuffer = await response.arrayBuffer().catch(convertError);
      return new Uint8Array(arrayBuffer);
    case 'json':
      return response.json().catch(convertError);
    default:
      throw new ApiError(ErrorCode.EINVAL, 'Invalid download type: ' + type);
  }
}

/**
 * Asynchronously retrieves the size of the given file in bytes.
 * @hidden
 */
export async function fetchFileSize(p: string): Promise<number> {
  const response = await fetch(p, { method: 'HEAD' }).catch(convertError);
  if (!response.ok) {
    throw new ApiError(
      ErrorCode.EIO,
      `fetch HEAD error: response returned code ${response.status}`,
    );
  }
  return parseInt(response.headers.get('Content-Length') || '-1', 10);
}
