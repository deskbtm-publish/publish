/**
 * BrowserFS's main module. This is exposed in the browser via the BrowserFS global.
 */

import { ApiError, ErrorCode } from './ApiError';
import { Cred } from './cred';
import fs from './emulation/fs';
import { mount, type MountMapping, setCred } from './emulation/shared';
import {
  type BFSCallback,
  type BFSOneArgCallback,
  FileSystem,
} from './filesystem';
import { providers } from './providers/index';
import { MemoryProvider } from './providers/Memory';
import type { ProviderConstructor } from './providers/provider';

/**
 * Initializes BrowserFS with the given file systems.
 */
export function initialize(
  mounts: { [point: string]: FileSystem },
  uid: number = 0,
  gid: number = 0,
) {
  setCred(new Cred(uid, gid, uid, gid, uid, gid));
  return fs.initialize(mounts);
}

/**
 * Defines a mapping of mount points to their configurations
 */
export interface ConfigMapping {
  [mountPoint: string]:
    | FileSystem
    | FileSystemConfiguration
    | keyof typeof providers;
}

/**
 * A configuration for BrowserFS
 */
export type Configuration =
  | FileSystem
  | FileSystemConfiguration
  | ConfigMapping;

async function _configure(config: Configuration): Promise<void> {
  if ('fs' in config || config instanceof FileSystem) {
    // single FS
    config = { '/': config } as ConfigMapping;
  }
  for (let [point, value] of Object.entries(config)) {
    if (typeof value == 'number') {
      //should never happen
      continue;
    }
    point = point.toString(); // so linting stops complaining that point should be declared with const, which can't be done since value is assigned to

    if (value instanceof FileSystem) {
      continue;
    }

    if (typeof value == 'string') {
      value = { fs: value };
    }

    config[point] = await getFileSystem(value);
  }
  return initialize(config as MountMapping);
}

/**
 * Creates a file system with the given configuration, and initializes BrowserFS with it.
 * See the FileSystemConfiguration type for more info on the configuration object.
 */
export function configure(config: Configuration): Promise<void>;
export function configure(config: Configuration, cb: BFSOneArgCallback): void;
export function configure(
  config: Configuration,
  cb?: BFSOneArgCallback,
): Promise<void> | void {
  // Promise version
  if (typeof cb != 'function') {
    return _configure(config);
  }

  // Callback version
  _configure(config)
    .then(() => cb())
    .catch((err) => cb(err));
  return;
}

/**
 * Asynchronously creates a file system with the given configuration, and initializes BrowserFS with it.
 * See the FileSystemConfiguration type for more info on the configuration object.
 * Note: unlike configure, the .then is provided with the file system
 */

/**
 * Specifies a file system backend type and its options.
 *
 * Individual options can recursively contain FileSystemConfiguration objects for
 * option values that require file systems.
 *
 * For example, to mirror Dropbox to Storage with AsyncMirrorProvider, use the following
 * object:
 *
 * ```javascript
 * var config = {
 *   fs: "AsyncMirrorProvider",
 *   options: {
 *     sync: {fs: "Storage"},
 *     async: {fs: "Dropbox", options: {client: anAuthenticatedDropboxSDKClient }}
 *   }
 * };
 * ```
 *
 * The option object for each file system corresponds to that file system's option object passed to its `Create()` method.
 */
export interface FileSystemConfiguration {
  fs: string;
  options?: object;
}

async function _getFileSystem({
  fs: fsName,
  options = {},
}: FileSystemConfiguration): Promise<FileSystem> {
  if (!fsName) {
    throw new ApiError(
      ErrorCode.EPERM,
      'Missing "fs" property on configuration object.',
    );
  }

  if (typeof options !== 'object' || options === null) {
    throw new ApiError(
      ErrorCode.EINVAL,
      'Invalid "options" property on configuration object.',
    );
  }

  const props = Object.keys(options).filter((k) => k != 'fs');

  for (const prop of props) {
    const opt = options[prop];
    if (opt === null || typeof opt !== 'object' || !('fs' in opt)) {
      continue;
    }

    const fs = await _getFileSystem(opt);
    options[prop] = fs;
  }

  const fsc = <ProviderConstructor | undefined>(<any>providers)[fsName];
  if (!fsc) {
    throw new ApiError(
      ErrorCode.EPERM,
      `File system ${fsName} is not available in BrowserFS.`,
    );
  } else {
    return fsc.Create(options);
  }
}

/**
 * Retrieve a file system with the given configuration. Will return a promise if invoked without a callback
 * @param config A FileSystemConfiguration object. See FileSystemConfiguration for details.
 * @param cb Called when the file system is constructed, or when an error occurs.
 */
export function getFileSystem(
  config: FileSystemConfiguration,
): Promise<FileSystem>;
export function getFileSystem(
  config: FileSystemConfiguration,
  cb: BFSCallback<FileSystem>,
): void;
export function getFileSystem(
  config: FileSystemConfiguration,
  cb?: BFSCallback<FileSystem>,
): Promise<FileSystem> | void {
  // Promise version
  if (typeof cb != 'function') {
    return _getFileSystem(config);
  }

  // Callback version
  _getFileSystem(config)
    .then((fs) => cb(undefined, fs))
    .catch((err) => cb(err));
  return;
}

/*
Set a default root.
There is a very small but not 0 change that initialize() will try to unmount the default before it is mounted.
This can be fixed by using a top-level await, which is not done to maintain ES6 compatibility.
*/
MemoryProvider.Create().then((fs) => mount('/', fs));

export * from './ApiError';
export * from './cred';
export * from './file';
export * from './FileIndex';
export * from './filesystem';
export * from './inode';
export * from './mutex';
export * from './providers';
export * from './providers/AsyncStore';
export * from './providers/SyncStore';
export * from './stats';
export * from './utils';
export { fs };
export default fs;
