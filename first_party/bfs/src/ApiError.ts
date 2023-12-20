import { decode, encode } from './utils';

/**
 * Standard libc error codes. More will be added to this enum and ErrorStrings as they are
 * needed.
 * @url http://www.gnu.org/software/libc/manual/html_node/Error-Codes.html
 */
export enum ErrorCode {
  EPERM = 1,
  ENOENT = 2,
  EIO = 5,
  EBADF = 9,
  EACCES = 13,
  EBUSY = 16,
  EEXIST = 17,
  ENOTDIR = 20,
  EISDIR = 21,
  EINVAL = 22,
  EFBIG = 27,
  ENOSPC = 28,
  EROFS = 30,
  ENOTEMPTY = 39,
  ENOTSUP = 95,
}

/**
 * Strings associated with each error code.
 * @internal
 */
export const ErrorStrings: { [code: string | number]: string } = {};
ErrorStrings[ErrorCode.EPERM] = 'Operation not permitted.';
ErrorStrings[ErrorCode.ENOENT] = 'No such file or directory.';
ErrorStrings[ErrorCode.EIO] = 'Input/output error.';
ErrorStrings[ErrorCode.EBADF] = 'Bad file descriptor.';
ErrorStrings[ErrorCode.EACCES] = 'Permission denied.';
ErrorStrings[ErrorCode.EBUSY] = 'Resource busy or locked.';
ErrorStrings[ErrorCode.EEXIST] = 'File exists.';
ErrorStrings[ErrorCode.ENOTDIR] = 'File is not a directory.';
ErrorStrings[ErrorCode.EISDIR] = 'File is a directory.';
ErrorStrings[ErrorCode.EINVAL] = 'Invalid argument.';
ErrorStrings[ErrorCode.EFBIG] = 'File is too big.';
ErrorStrings[ErrorCode.ENOSPC] = 'No space left on disk.';
ErrorStrings[ErrorCode.EROFS] = 'Cannot modify a read-only file system.';
ErrorStrings[ErrorCode.ENOTEMPTY] = 'Directory is not empty.';
ErrorStrings[ErrorCode.ENOTSUP] = 'Operation is not supported.';

interface ApiErrorJSON {
  errno: ErrorCode;
  message: string;
  path: string;
  code: string;
  stack: string;
}

/**
 * Represents a BrowserFS error. Passed back to applications after a failed
 * call to the BrowserFS API.
 */
export class ApiError extends Error implements NodeJS.ErrnoException {
  public static fromJSON(json: ApiErrorJSON): ApiError {
    const err = new ApiError(json.errno, json.message, json.path);
    err.code = json.code;
    err.stack = json.stack;
    return err;
  }

  /**
   * Creates an ApiError object from a buffer.
   */
  public static Derserialize(
    data: ArrayBufferLike | ArrayBufferView,
    i: number = 0,
  ): ApiError {
    const view = new DataView('buffer' in data ? data.buffer : data);
    const dataText = decode(
      view.buffer.slice(i + 4, i + 4 + view.getUint32(i, true)),
    );
    return ApiError.fromJSON(JSON.parse(dataText));
  }

  public static FileError(code: ErrorCode, p: string): ApiError {
    return new ApiError(code, ErrorStrings[code], p);
  }

  public static EACCES(path: string): ApiError {
    return this.FileError(ErrorCode.EACCES, path);
  }

  public static ENOENT(path: string): ApiError {
    return this.FileError(ErrorCode.ENOENT, path);
  }

  public static EEXIST(path: string): ApiError {
    return this.FileError(ErrorCode.EEXIST, path);
  }

  public static EISDIR(path: string): ApiError {
    return this.FileError(ErrorCode.EISDIR, path);
  }

  public static ENOTDIR(path: string): ApiError {
    return this.FileError(ErrorCode.ENOTDIR, path);
  }

  public static EPERM(path: string): ApiError {
    return this.FileError(ErrorCode.EPERM, path);
  }

  public static ENOTEMPTY(path: string): ApiError {
    return this.FileError(ErrorCode.ENOTEMPTY, path);
  }

  public errno: ErrorCode;
  public code: string;
  public path?: string;
  // Unsupported.
  public syscall: string = '';
  public override stack?: string;

  /**
   * Represents a BrowserFS error. Passed back to applications after a failed
   * call to the BrowserFS API.
   *
   * Error codes mirror those returned by regular Unix file operations, which is
   * what Node returns.
   * @constructor ApiError
   * @param type The type of the error.
   * @param [message] A descriptive error message.
   */
  constructor(
    type: ErrorCode,
    message: string = ErrorStrings[type],
    path?: string,
  ) {
    super(message);
    this.errno = type;
    this.code = ErrorCode[type];
    this.path = path;
    this.message = `Error: ${this.code}: ${message}${
      this.path ? `, '${this.path}'` : ''
    }`;
  }

  /**
   * @return A friendly error message.
   */
  public override toString(): string {
    return this.message;
  }

  public toJSON(): any {
    return {
      errno: this.errno,
      code: this.code,
      path: this.path,
      stack: this.stack,
      message: this.message,
    };
  }

  /**
   * Writes the API error into a buffer.
   */
  public serialize(
    data: ArrayBufferLike | ArrayBufferView = new Uint8Array(this.bufferSize()),
    i: number = 0,
  ): Uint8Array {
    const view = new DataView('buffer' in data ? data.buffer : data),
      buffer = new Uint8Array(view.buffer);
    const newData = encode(JSON.stringify(this.toJSON()));
    buffer.set(newData);
    view.setUint32(i, newData.byteLength, true);
    return buffer;
  }

  /**
   * The size of the API error in buffer-form in bytes.
   */
  public bufferSize(): number {
    // 4 bytes for string length.
    return 4 + JSON.stringify(this.toJSON()).length;
  }
}
