import { ApiError, ErrorCode } from '../ApiError';
import { Cred } from '../cred';
import { dirname, resolve } from '../emulation/path';
import type { File } from '../file';
import { ActionType, FileFlag, PreloadFile } from '../file';
import type { FileSystemMetadata } from '../filesystem';
import { BaseFileSystem, type FileSystem } from '../filesystem';
import { Stats } from '../stats';
import { decode, encode } from '../utils';
import LockedFS from './Locked';
import { CreateProvider, type ProviderOptions } from './provider';
/**
 * @internal
 */
const deletionLogPath = '/.deletedFiles.log';

/**
 * Given a read-only mode, makes it writable.
 * @internal
 */
function makeModeWritable(mode: number): number {
  return 0o222 | mode;
}

/**
 * @internal
 */
function getFlag(f: string): FileFlag {
  return FileFlag.getFileFlag(f);
}

/**
 * Overlays a RO file to make it writable.
 */
class OverlayFile extends PreloadFile<UnlockedOverlayFS> implements File {
  constructor(
    fs: UnlockedOverlayFS,
    path: string,
    flag: FileFlag,
    stats: Stats,
    data: Uint8Array,
  ) {
    super(fs, path, flag, stats, data);
  }

  public override async sync(): Promise<void> {
    if (!this.isDirty()) {
      return;
    }

    await this._fs._syncAsync(this);
    this.resetDirty();
  }

  public override syncSync(): void {
    if (this.isDirty()) {
      this._fs._syncSync(this);
      this.resetDirty();
    }
  }

  public override async close(): Promise<void> {
    await this.sync();
  }

  public override closeSync(): void {
    this.syncSync();
  }
}

export namespace OverlayFS {
  /**
   * Configuration options for OverlayFS instances.
   */
  export interface Options {
    /**
     * The file system to write modified files to.
     */
    writable: FileSystem;
    /**
     * The file system that initially populates this file system.
     */
    readable: FileSystem;
  }
}

/**
 * *INTERNAL, DO NOT USE DIRECTLY!*
 *
 * Core OverlayFS class that contains no locking whatsoever. We wrap these objects
 * in a LockedFS to prevent races.
 */
export class UnlockedOverlayFS extends BaseFileSystem {
  public static isAvailable(): boolean {
    return true;
  }

  private _writable: FileSystem;
  private _readable: FileSystem;
  private _isInitialized: boolean = false;
  private _deletedFiles: { [path: string]: boolean } = {};
  private _deleteLog: string = '';
  // If 'true', we have scheduled a delete log update.
  private _deleteLogUpdatePending: boolean = false;
  // If 'true', a delete log update is needed after the scheduled delete log
  // update finishes.
  private _deleteLogUpdateNeeded: boolean = false;
  // If there was an error updating the delete log...
  private _deleteLogError: ApiError | null = null;

  constructor({ writable, readable }: OverlayFS.Options) {
    super();
    this._writable = writable;
    this._readable = readable;
    if (this._writable.metadata.readonly) {
      throw new ApiError(
        ErrorCode.EINVAL,
        'Writable file system must be writable.',
      );
    }
  }

  public override get metadata(): FileSystemMetadata {
    return {
      ...super.metadata,
      name: OverlayFS.Name,
      synchronous:
        this._readable.metadata.synchronous &&
        this._writable.metadata.synchronous,
      supportsProperties:
        this._readable.metadata.supportsProperties &&
        this._writable.metadata.supportsProperties,
    };
  }

  public getOverlayedFileSystems(): {
    readable: FileSystem;
    writable: FileSystem;
  } {
    return {
      readable: this._readable,
      writable: this._writable,
    };
  }

  public async _syncAsync(file: PreloadFile<UnlockedOverlayFS>): Promise<void> {
    const stats = file.getStats();
    await this.createParentDirectoriesAsync(
      file.getPath(),
      stats.getCred(0, 0),
    );
    return this._writable.writeFile(
      file.getPath(),
      file.getBuffer(),
      getFlag('w'),
      stats.mode,
      stats.getCred(0, 0),
    );
  }

  public _syncSync(file: PreloadFile<UnlockedOverlayFS>): void {
    const stats = file.getStats();
    this.createParentDirectories(file.getPath(), stats.getCred(0, 0));
    this._writable.writeFileSync(
      file.getPath(),
      file.getBuffer(),
      getFlag('w'),
      stats.mode,
      stats.getCred(0, 0),
    );
  }

  /**
   * **INTERNAL METHOD**
   *
   * Called once to load up metadata stored on the writable file system.
   */
  public async _initialize(): Promise<void> {
    // if we're already initialized, immediately invoke the callback
    if (this._isInitialized) {
      return;
    }

    // Read deletion log, process into metadata.
    try {
      const data = await this._writable.readFile(
        deletionLogPath,
        getFlag('r'),
        Cred.Root,
      );
      this._deleteLog = decode(data);
    } catch (err: any) {
      if (err.errno !== ErrorCode.ENOENT) {
        throw err;
      }
    }
    this._isInitialized = true;
    this._reparseDeletionLog();
  }

  public getDeletionLog(): string {
    return this._deleteLog;
  }

  public restoreDeletionLog(log: string, cred: Cred): void {
    this._deleteLog = log;
    this._reparseDeletionLog();
    this.updateLog('', cred);
  }

  public override async rename(
    oldPath: string,
    newPath: string,
    cred: Cred,
  ): Promise<void> {
    this.checkInitialized();
    this.checkPath(oldPath);
    this.checkPath(newPath);
    if (oldPath === deletionLogPath || newPath === deletionLogPath) {
      throw ApiError.EPERM('Cannot rename deletion log.');
    }
    // Write newPath using oldPath's contents, delete oldPath.
    const oldStats = await this.stat(oldPath, cred);
    if (oldStats.isDirectory()) {
      // Optimization: Don't bother moving if old === new.
      if (oldPath === newPath) {
        return;
      }

      let mode = 0o777;
      if (await this.exists(newPath, cred)) {
        const stats = await this.stat(newPath, cred);
        mode = stats.mode;
        if (stats.isDirectory()) {
          if ((await this.readdir(newPath, cred)).length > 0) {
            throw ApiError.ENOTEMPTY(newPath);
          }
        } else {
          throw ApiError.ENOTDIR(newPath);
        }
      }

      // Take care of writable first. Move any files there, or create an empty directory
      // if it doesn't exist.
      if (await this._writable.exists(oldPath, cred)) {
        await this._writable.rename(oldPath, newPath, cred);
      } else if (!(await this._writable.exists(newPath, cred))) {
        await this._writable.mkdir(newPath, mode, cred);
      }

      // Need to move *every file/folder* currently stored on readable to its new location
      // on writable.
      if (await this._readable.exists(oldPath, cred)) {
        for (const name of await this._readable.readdir(oldPath, cred)) {
          // Recursion! Should work for any nested files / folders.
          await this.rename(
            resolve(oldPath, name),
            resolve(newPath, name),
            cred,
          );
        }
      }
    } else {
      if (
        (await this.exists(newPath, cred)) &&
        (await this.stat(newPath, cred)).isDirectory()
      ) {
        throw ApiError.EISDIR(newPath);
      }

      await this.writeFile(
        newPath,
        await this.readFile(oldPath, getFlag('r'), cred),
        getFlag('w'),
        oldStats.mode,
        cred,
      );
    }

    if (oldPath !== newPath && (await this.exists(oldPath, cred))) {
      await this.unlink(oldPath, cred);
    }
  }

  public override renameSync(
    oldPath: string,
    newPath: string,
    cred: Cred,
  ): void {
    this.checkInitialized();
    this.checkPath(oldPath);
    this.checkPath(newPath);
    if (oldPath === deletionLogPath || newPath === deletionLogPath) {
      throw ApiError.EPERM('Cannot rename deletion log.');
    }
    // Write newPath using oldPath's contents, delete oldPath.
    const oldStats = this.statSync(oldPath, cred);
    if (oldStats.isDirectory()) {
      // Optimization: Don't bother moving if old === new.
      if (oldPath === newPath) {
        return;
      }

      let mode = 0o777;
      if (this.existsSync(newPath, cred)) {
        const stats = this.statSync(newPath, cred);
        mode = stats.mode;
        if (stats.isDirectory()) {
          if (this.readdirSync(newPath, cred).length > 0) {
            throw ApiError.ENOTEMPTY(newPath);
          }
        } else {
          throw ApiError.ENOTDIR(newPath);
        }
      }

      // Take care of writable first. Move any files there, or create an empty directory
      // if it doesn't exist.
      if (this._writable.existsSync(oldPath, cred)) {
        this._writable.renameSync(oldPath, newPath, cred);
      } else if (!this._writable.existsSync(newPath, cred)) {
        this._writable.mkdirSync(newPath, mode, cred);
      }

      // Need to move *every file/folder* currently stored on readable to its new location
      // on writable.
      if (this._readable.existsSync(oldPath, cred)) {
        this._readable.readdirSync(oldPath, cred).forEach((name) => {
          // Recursion! Should work for any nested files / folders.
          this.renameSync(resolve(oldPath, name), resolve(newPath, name), cred);
        });
      }
    } else {
      if (
        this.existsSync(newPath, cred) &&
        this.statSync(newPath, cred).isDirectory()
      ) {
        throw ApiError.EISDIR(newPath);
      }

      this.writeFileSync(
        newPath,
        this.readFileSync(oldPath, getFlag('r'), cred),
        getFlag('w'),
        oldStats.mode,
        cred,
      );
    }

    if (oldPath !== newPath && this.existsSync(oldPath, cred)) {
      this.unlinkSync(oldPath, cred);
    }
  }

  public override async stat(p: string, cred: Cred): Promise<Stats> {
    this.checkInitialized();
    try {
      return this._writable.stat(p, cred);
    } catch (e) {
      if (this._deletedFiles[p]) {
        throw ApiError.ENOENT(p);
      }
      const oldStat = Stats.clone(await this._readable.stat(p, cred));
      // Make the oldStat's mode writable. Preserve the topmost part of the
      // mode, which specifies if it is a file or a directory.
      oldStat.mode = makeModeWritable(oldStat.mode);
      return oldStat;
    }
  }

  public override statSync(p: string, cred: Cred): Stats {
    this.checkInitialized();
    try {
      return this._writable.statSync(p, cred);
    } catch (e) {
      if (this._deletedFiles[p]) {
        throw ApiError.ENOENT(p);
      }
      const oldStat = Stats.clone(this._readable.statSync(p, cred));
      // Make the oldStat's mode writable. Preserve the topmost part of the
      // mode, which specifies if it is a file or a directory.
      oldStat.mode = makeModeWritable(oldStat.mode);
      return oldStat;
    }
  }

  public override async open(
    p: string,
    flag: FileFlag,
    mode: number,
    cred: Cred,
  ): Promise<File> {
    this.checkInitialized();
    this.checkPath(p);
    if (p === deletionLogPath) {
      throw ApiError.EPERM('Cannot open deletion log.');
    }
    if (await this.exists(p, cred)) {
      switch (flag.pathExistsAction()) {
        case ActionType.TRUNCATE_FILE:
          await this.createParentDirectoriesAsync(p, cred);
          return this._writable.open(p, flag, mode, cred);
        case ActionType.NOP:
          if (await this._writable.exists(p, cred)) {
            return this._writable.open(p, flag, mode, cred);
          } else {
            // Create an OverlayFile.
            const buf = await this._readable.readFile(p, getFlag('r'), cred);
            const stats = Stats.clone(await this._readable.stat(p, cred));
            stats.mode = mode;
            return new OverlayFile(this, p, flag, stats, buf as Uint8Array);
          }
        default:
          throw ApiError.EEXIST(p);
      }
    } else {
      switch (flag.pathNotExistsAction()) {
        case ActionType.CREATE_FILE:
          await this.createParentDirectoriesAsync(p, cred);
          return this._writable.open(p, flag, mode, cred);
        default:
          throw ApiError.ENOENT(p);
      }
    }
  }

  public override openSync(
    p: string,
    flag: FileFlag,
    mode: number,
    cred: Cred,
  ): File {
    this.checkInitialized();
    this.checkPath(p);
    if (p === deletionLogPath) {
      throw ApiError.EPERM('Cannot open deletion log.');
    }
    if (this.existsSync(p, cred)) {
      switch (flag.pathExistsAction()) {
        case ActionType.TRUNCATE_FILE:
          this.createParentDirectories(p, cred);
          return this._writable.openSync(p, flag, mode, cred);
        case ActionType.NOP:
          if (this._writable.existsSync(p, cred)) {
            return this._writable.openSync(p, flag, mode, cred);
          } else {
            // Create an OverlayFile.
            const buf = <Uint8Array>(
              this._readable.readFileSync(p, getFlag('r'), cred)
            );
            const stats = Stats.clone(this._readable.statSync(p, cred));
            stats.mode = mode;
            return new OverlayFile(this, p, flag, stats, buf);
          }
        default:
          throw ApiError.EEXIST(p);
      }
    } else {
      switch (flag.pathNotExistsAction()) {
        case ActionType.CREATE_FILE:
          this.createParentDirectories(p, cred);
          return this._writable.openSync(p, flag, mode, cred);
        default:
          throw ApiError.ENOENT(p);
      }
    }
  }

  public override async unlink(p: string, cred: Cred): Promise<void> {
    this.checkInitialized();
    this.checkPath(p);
    if (await this.exists(p, cred)) {
      if (await this._writable.exists(p, cred)) {
        await this._writable.unlink(p, cred);
      }

      // if it still exists add to the delete log
      if (await this.exists(p, cred)) {
        this.deletePath(p, cred);
      }
    } else {
      throw ApiError.ENOENT(p);
    }
  }

  public override unlinkSync(p: string, cred: Cred): void {
    this.checkInitialized();
    this.checkPath(p);
    if (this.existsSync(p, cred)) {
      if (this._writable.existsSync(p, cred)) {
        this._writable.unlinkSync(p, cred);
      }

      // if it still exists add to the delete log
      if (this.existsSync(p, cred)) {
        this.deletePath(p, cred);
      }
    } else {
      throw ApiError.ENOENT(p);
    }
  }

  public override async rmdir(p: string, cred: Cred): Promise<void> {
    this.checkInitialized();
    if (await this.exists(p, cred)) {
      if (await this._writable.exists(p, cred)) {
        await this._writable.rmdir(p, cred);
      }
      if (await this.exists(p, cred)) {
        // Check if directory is empty.
        if ((await this.readdir(p, cred)).length > 0) {
          throw ApiError.ENOTEMPTY(p);
        } else {
          this.deletePath(p, cred);
        }
      }
    } else {
      throw ApiError.ENOENT(p);
    }
  }

  public override rmdirSync(p: string, cred: Cred): void {
    this.checkInitialized();
    if (this.existsSync(p, cred)) {
      if (this._writable.existsSync(p, cred)) {
        this._writable.rmdirSync(p, cred);
      }
      if (this.existsSync(p, cred)) {
        // Check if directory is empty.
        if (this.readdirSync(p, cred).length > 0) {
          throw ApiError.ENOTEMPTY(p);
        } else {
          this.deletePath(p, cred);
        }
      }
    } else {
      throw ApiError.ENOENT(p);
    }
  }

  public override async mkdir(
    p: string,
    mode: number,
    cred: Cred,
  ): Promise<void> {
    this.checkInitialized();
    if (await this.exists(p, cred)) {
      throw ApiError.EEXIST(p);
    } else {
      // The below will throw should any of the parent directories fail to exist
      // on _writable.
      await this.createParentDirectoriesAsync(p, cred);
      await this._writable.mkdir(p, mode, cred);
    }
  }

  public override mkdirSync(p: string, mode: number, cred: Cred): void {
    this.checkInitialized();
    if (this.existsSync(p, cred)) {
      throw ApiError.EEXIST(p);
    } else {
      // The below will throw should any of the parent directories fail to exist
      // on _writable.
      this.createParentDirectories(p, cred);
      this._writable.mkdirSync(p, mode, cred);
    }
  }

  public override async readdir(p: string, cred: Cred): Promise<string[]> {
    this.checkInitialized();
    const dirStats = await this.stat(p, cred);
    if (!dirStats.isDirectory()) {
      throw ApiError.ENOTDIR(p);
    }

    // Readdir in both, check delete log on RO file system's listing, merge, return.
    let contents: string[] = [];
    try {
      contents = contents.concat(await this._writable.readdir(p, cred));
    } catch (e) {
      // NOP.
    }
    try {
      contents = contents.concat(
        (await this._readable.readdir(p, cred)).filter(
          (fPath: string) => !this._deletedFiles[`${p}/${fPath}`],
        ),
      );
    } catch (e) {
      // NOP.
    }
    const seenMap: { [name: string]: boolean } = {};
    return contents.filter((fileP: string) => {
      const result = !seenMap[fileP];
      seenMap[fileP] = true;
      return result;
    });
  }

  public override readdirSync(p: string, cred: Cred): string[] {
    this.checkInitialized();
    const dirStats = this.statSync(p, cred);
    if (!dirStats.isDirectory()) {
      throw ApiError.ENOTDIR(p);
    }

    // Readdir in both, check delete log on RO file system's listing, merge, return.
    let contents: string[] = [];
    try {
      contents = contents.concat(this._writable.readdirSync(p, cred));
    } catch (e) {
      // NOP.
    }
    try {
      contents = contents.concat(
        this._readable
          .readdirSync(p, cred)
          .filter((fPath: string) => !this._deletedFiles[`${p}/${fPath}`]),
      );
    } catch (e) {
      // NOP.
    }
    const seenMap: { [name: string]: boolean } = {};
    return contents.filter((fileP: string) => {
      const result = !seenMap[fileP];
      seenMap[fileP] = true;
      return result;
    });
  }

  public override async exists(p: string, cred: Cred): Promise<boolean> {
    this.checkInitialized();
    return (
      (await this._writable.exists(p, cred)) ||
      ((await this._readable.exists(p, cred)) && this._deletedFiles[p] !== true)
    );
  }

  public override existsSync(p: string, cred: Cred): boolean {
    this.checkInitialized();
    return (
      this._writable.existsSync(p, cred) ||
      (this._readable.existsSync(p, cred) && this._deletedFiles[p] !== true)
    );
  }

  public override async chmod(
    p: string,
    mode: number,
    cred: Cred,
  ): Promise<void> {
    this.checkInitialized();
    await this.operateOnWritableAsync(p, cred);
    await this._writable.chmod(p, mode, cred);
  }

  public override chmodSync(p: string, mode: number, cred: Cred): void {
    this.checkInitialized();
    this.operateOnWritable(p, cred);
    this._writable.chmodSync(p, mode, cred);
  }

  public override async chown(
    p: string,
    new_uid: number,
    new_gid: number,
    cred: Cred,
  ): Promise<void> {
    this.checkInitialized();
    await this.operateOnWritableAsync(p, cred);
    await this._writable.chown(p, new_uid, new_gid, cred);
  }

  public override chownSync(
    p: string,
    new_uid: number,
    new_gid: number,
    cred: Cred,
  ): void {
    this.checkInitialized();
    this.operateOnWritable(p, cred);
    this._writable.chownSync(p, new_uid, new_gid, cred);
  }

  public override async utimes(
    p: string,
    atime: Date,
    mtime: Date,
    cred: Cred,
  ): Promise<void> {
    this.checkInitialized();
    await this.operateOnWritableAsync(p, cred);
    await this._writable.utimes(p, atime, mtime, cred);
  }

  public override utimesSync(
    p: string,
    atime: Date,
    mtime: Date,
    cred: Cred,
  ): void {
    this.checkInitialized();
    this.operateOnWritable(p, cred);
    this._writable.utimesSync(p, atime, mtime, cred);
  }

  private deletePath(p: string, cred: Cred): void {
    this._deletedFiles[p] = true;
    this.updateLog(`d${p}\n`, cred);
  }

  private updateLog(addition: string, cred: Cred) {
    this._deleteLog += addition;
    if (this._deleteLogUpdatePending) {
      this._deleteLogUpdateNeeded = true;
    } else {
      this._deleteLogUpdatePending = true;
      this._writable
        .writeFile(
          deletionLogPath,
          encode(this._deleteLog),
          FileFlag.getFileFlag('w'),
          0o644,
          cred,
        )
        .then(() => {
          if (this._deleteLogUpdateNeeded) {
            this._deleteLogUpdateNeeded = false;
            this.updateLog('', cred);
          }
        })
        .catch((e) => {
          this._deleteLogError = e;
        })
        .finally(() => {
          this._deleteLogUpdatePending = false;
        });
    }
  }

  private _reparseDeletionLog(): void {
    this._deletedFiles = {};
    this._deleteLog.split('\n').forEach((path: string) => {
      // If the log entry begins w/ 'd', it's a deletion.
      this._deletedFiles[path.slice(1)] = path.slice(0, 1) === 'd';
    });
  }

  private checkInitialized(): void {
    if (!this._isInitialized) {
      throw new ApiError(
        ErrorCode.EPERM,
        'OverlayFS is not initialized. Please initialize OverlayFS using its initialize() method before using it.',
      );
    } else if (this._deleteLogError !== null) {
      const e = this._deleteLogError;
      this._deleteLogError = null;
      throw e;
    }
  }

  private checkPath(p: string): void {
    if (p === deletionLogPath) {
      throw ApiError.EPERM(p);
    }
  }

  /**
   * With the given path, create the needed parent directories on the writable storage
   * should they not exist. Use modes from the read-only storage.
   */
  private createParentDirectories(p: string, cred: Cred): void {
    let parent = dirname(p),
      toCreate: string[] = [];
    while (!this._writable.existsSync(parent, cred)) {
      toCreate.push(parent);
      parent = dirname(parent);
    }
    toCreate = toCreate.reverse();

    for (const p of toCreate) {
      this._writable.mkdirSync(p, this.statSync(p, cred).mode, cred);
    }
  }

  private async createParentDirectoriesAsync(
    p: string,
    cred: Cred,
  ): Promise<void> {
    let parent = dirname(p),
      toCreate: string[] = [];
    while (!(await this._writable.exists(parent, cred))) {
      toCreate.push(parent);
      parent = dirname(parent);
    }
    toCreate = toCreate.reverse();

    for (const p of toCreate) {
      const stats = await this.stat(p, cred);
      await this._writable.mkdir(p, stats.mode, cred);
    }
  }

  /**
   * Helper function:
   * - Ensures p is on writable before proceeding. Throws an error if it doesn't exist.
   * - Calls f to perform operation on writable.
   */
  private operateOnWritable(p: string, cred: Cred): void {
    if (!this.existsSync(p, cred)) {
      throw ApiError.ENOENT(p);
    }
    if (!this._writable.existsSync(p, cred)) {
      // File is on readable storage. Copy to writable storage before
      // changing its mode.
      this.copyToWritable(p, cred);
    }
  }

  private async operateOnWritableAsync(p: string, cred: Cred): Promise<void> {
    if (!(await this.exists(p, cred))) {
      throw ApiError.ENOENT(p);
    }

    if (!(await this._writable.exists(p, cred))) {
      return this.copyToWritableAsync(p, cred);
    }
  }

  /**
   * Copy from readable to writable storage.
   * PRECONDITION: File does not exist on writable storage.
   */
  private copyToWritable(p: string, cred: Cred): void {
    const pStats = this.statSync(p, cred);
    if (pStats.isDirectory()) {
      this._writable.mkdirSync(p, pStats.mode, cred);
    } else {
      this.writeFileSync(
        p,
        this._readable.readFileSync(p, getFlag('r'), cred),
        getFlag('w'),
        pStats.mode,
        cred,
      );
    }
  }

  private async copyToWritableAsync(p: string, cred: Cred): Promise<void> {
    const pStats = await this.stat(p, cred);
    if (pStats.isDirectory()) {
      await this._writable.mkdir(p, pStats.mode, cred);
    } else {
      await this.writeFile(
        p,
        await this._readable.readFile(p, getFlag('r'), cred),
        getFlag('w'),
        pStats.mode,
        cred,
      );
    }
  }
}

/**
 * OverlayFS makes a read-only filesystem writable by storing writes on a second,
 * writable file system. Deletes are persisted via metadata stored on the writable
 * file system.
 */
export class OverlayFS extends LockedFS<UnlockedOverlayFS> {
  public static readonly Name = 'OverlayFS';

  public static Create = CreateProvider.bind(this);

  public static readonly Options: ProviderOptions = {
    writable: {
      type: 'object',
      description: 'The file system to write modified files to.',
    },
    readable: {
      type: 'object',
      description: 'The file system that initially populates this file system.',
    },
  };

  public static isAvailable(): boolean {
    return UnlockedOverlayFS.isAvailable();
  }

  /**
   * @param options The options to initialize the OverlayFS with
   */
  constructor(options: OverlayFS.Options) {
    super(new UnlockedOverlayFS(options));
    this._ready = this._initialize();
  }

  public getOverlayedFileSystems(): OverlayFS.Options {
    return super.fs.getOverlayedFileSystems();
  }

  public getDeletionLog(): string {
    return super.fs.getDeletionLog();
  }

  public resDeletionLog(): string {
    return super.fs.getDeletionLog();
  }

  public unwrap(): UnlockedOverlayFS {
    return super.fs;
  }

  private async _initialize(): Promise<this> {
    await super.fs._initialize();
    return this;
  }
}
