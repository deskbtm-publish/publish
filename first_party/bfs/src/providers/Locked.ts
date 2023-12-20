import type { Cred } from '../cred';
import type { FileFlag } from '../file';
import type { File } from '../file';
import type { FileSystem, FileSystemMetadata } from '../filesystem';
import Mutex from '../mutex';
import type { Stats } from '../stats';

/**
 * This class serializes access to an underlying async filesystem.
 * For example, on an OverlayFSProvider instance with an async lower
 * directory operations like rename and rmdir may involve multiple
 * requests involving both the upper and lower filesystems -- they
 * are not executed in a single atomic step.  OverlayFSProvider uses this
 * LockedFS to avoid having to reason about the correctness of
 * multiple requests interleaving.
 */
export default class LockedFS<T extends FileSystem> implements FileSystem {
  private _fs: T;
  private _mu: Mutex;

  protected _ready: Promise<this> = Promise.resolve(this);

  constructor(fs: T) {
    this._fs = fs;
    this._mu = new Mutex();
  }

  whenReady(): Promise<this> {
    return this._ready;
  }

  public get metadata(): FileSystemMetadata {
    return {
      ...this._fs.metadata,
      name: 'LockedFS<' + this._fs.metadata.name + '>',
    };
  }

  public get fs(): T {
    return this._fs;
  }

  public async rename(
    oldPath: string,
    newPath: string,
    cred: Cred,
  ): Promise<void> {
    await this._mu.lock(oldPath);
    await this._fs.rename(oldPath, newPath, cred);
    this._mu.unlock(oldPath);
  }

  public renameSync(oldPath: string, newPath: string, cred: Cred): void {
    if (this._mu.isLocked(oldPath)) {
      throw new Error('invalid sync call');
    }
    return this._fs.renameSync(oldPath, newPath, cred);
  }

  public async stat(p: string, cred: Cred): Promise<Stats> {
    await this._mu.lock(p);
    const stats = await this._fs.stat(p, cred);
    this._mu.unlock(p);
    return stats as Stats;
  }

  public statSync(p: string, cred: Cred): Stats {
    if (this._mu.isLocked(p)) {
      throw new Error('invalid sync call');
    }
    return this._fs.statSync(p, cred);
  }

  public async access(p: string, mode: number, cred: Cred): Promise<void> {
    await this._mu.lock(p);
    await this._fs.access(p, mode, cred);
    this._mu.unlock(p);
  }

  public accessSync(p: string, mode: number, cred: Cred): void {
    if (this._mu.isLocked(p)) {
      throw new Error('invalid sync call');
    }
    return this._fs.accessSync(p, mode, cred);
  }

  public async open(
    p: string,
    flag: FileFlag,
    mode: number,
    cred: Cred,
  ): Promise<File> {
    await this._mu.lock(p);
    const fd = await this._fs.open(p, flag, mode, cred);
    this._mu.unlock(p);
    return fd;
  }

  public openSync(p: string, flag: FileFlag, mode: number, cred: Cred): File {
    if (this._mu.isLocked(p)) {
      throw new Error('invalid sync call');
    }
    return this._fs.openSync(p, flag, mode, cred);
  }

  public async unlink(p: string, cred: Cred): Promise<void> {
    await this._mu.lock(p);
    await this._fs.unlink(p, cred);
    this._mu.unlock(p);
  }

  public unlinkSync(p: string, cred: Cred): void {
    if (this._mu.isLocked(p)) {
      throw new Error('invalid sync call');
    }
    return this._fs.unlinkSync(p, cred);
  }

  public async rmdir(p: string, cred: Cred): Promise<void> {
    await this._mu.lock(p);
    await this._fs.rmdir(p, cred);
    this._mu.unlock(p);
  }

  public rmdirSync(p: string, cred: Cred): void {
    if (this._mu.isLocked(p)) {
      throw new Error('invalid sync call');
    }
    return this._fs.rmdirSync(p, cred);
  }

  public async mkdir(p: string, mode: number, cred: Cred): Promise<void> {
    await this._mu.lock(p);
    await this._fs.mkdir(p, mode, cred);
    this._mu.unlock(p);
  }

  public mkdirSync(p: string, mode: number, cred: Cred): void {
    if (this._mu.isLocked(p)) {
      throw new Error('invalid sync call');
    }
    return this._fs.mkdirSync(p, mode, cred);
  }

  public async readdir(p: string, cred: Cred): Promise<string[]> {
    await this._mu.lock(p);
    const files = await this._fs.readdir(p, cred);
    this._mu.unlock(p);
    return files;
  }

  public readdirSync(p: string, cred: Cred): string[] {
    if (this._mu.isLocked(p)) {
      throw new Error('invalid sync call');
    }
    return this._fs.readdirSync(p, cred);
  }

  public async exists(p: string, cred: Cred): Promise<boolean> {
    await this._mu.lock(p);
    const exists = await this._fs.exists(p, cred);
    this._mu.unlock(p);
    return exists;
  }

  public existsSync(p: string, cred: Cred): boolean {
    if (this._mu.isLocked(p)) {
      throw new Error('invalid sync call');
    }
    return this._fs.existsSync(p, cred);
  }

  public async realpath(p: string, cred: Cred): Promise<string> {
    await this._mu.lock(p);
    const resolvedPath = await this._fs.realpath(p, cred);
    this._mu.unlock(p);
    return resolvedPath;
  }

  public realpathSync(p: string, cred: Cred): string {
    if (this._mu.isLocked(p)) {
      throw new Error('invalid sync call');
    }
    return this._fs.realpathSync(p, cred);
  }

  public async truncate(p: string, len: number, cred: Cred): Promise<void> {
    await this._mu.lock(p);
    await this._fs.truncate(p, len, cred);
    this._mu.unlock(p);
  }

  public truncateSync(p: string, len: number, cred: Cred): void {
    if (this._mu.isLocked(p)) {
      throw new Error('invalid sync call');
    }
    return this._fs.truncateSync(p, len, cred);
  }

  public async readFile(
    fname: string,
    flag: FileFlag,
    cred: Cred,
  ): Promise<Uint8Array> {
    await this._mu.lock(fname);
    const data = await this._fs.readFile(fname, flag, cred);
    this._mu.unlock(fname);
    return data;
  }

  public readFileSync(fname: string, flag: FileFlag, cred: Cred): Uint8Array {
    if (this._mu.isLocked(fname)) {
      throw new Error('invalid sync call');
    }
    return this._fs.readFileSync(fname, flag, cred);
  }

  public async writeFile(
    fname: string,
    data: Uint8Array,
    flag: FileFlag,
    mode: number,
    cred: Cred,
  ): Promise<void> {
    await this._mu.lock(fname);
    await this._fs.writeFile(fname, data, flag, mode, cred);
    this._mu.unlock(fname);
  }

  public writeFileSync(
    fname: string,
    data: Uint8Array,
    flag: FileFlag,
    mode: number,
    cred: Cred,
  ): void {
    if (this._mu.isLocked(fname)) {
      throw new Error('invalid sync call');
    }
    return this._fs.writeFileSync(fname, data, flag, mode, cred);
  }

  public async appendFile(
    fname: string,
    data: Uint8Array,
    flag: FileFlag,
    mode: number,
    cred: Cred,
  ): Promise<void> {
    await this._mu.lock(fname);
    await this._fs.appendFile(fname, data, flag, mode, cred);
    this._mu.unlock(fname);
  }

  public appendFileSync(
    fname: string,
    data: Uint8Array,
    flag: FileFlag,
    mode: number,
    cred: Cred,
  ): void {
    if (this._mu.isLocked(fname)) {
      throw new Error('invalid sync call');
    }
    return this._fs.appendFileSync(fname, data, flag, mode, cred);
  }

  public async chmod(p: string, mode: number, cred: Cred): Promise<void> {
    await this._mu.lock(p);
    await this._fs.chmod(p, mode, cred);
    this._mu.unlock(p);
  }

  public chmodSync(p: string, mode: number, cred: Cred): void {
    if (this._mu.isLocked(p)) {
      throw new Error('invalid sync call');
    }
    return this._fs.chmodSync(p, mode, cred);
  }

  public async chown(
    p: string,
    new_uid: number,
    new_gid: number,
    cred: Cred,
  ): Promise<void> {
    await this._mu.lock(p);
    await this._fs.chown(p, new_uid, new_gid, cred);
    this._mu.unlock(p);
  }

  public chownSync(
    p: string,
    new_uid: number,
    new_gid: number,
    cred: Cred,
  ): void {
    if (this._mu.isLocked(p)) {
      throw new Error('invalid sync call');
    }
    return this._fs.chownSync(p, new_uid, new_gid, cred);
  }

  public async utimes(
    p: string,
    atime: Date,
    mtime: Date,
    cred: Cred,
  ): Promise<void> {
    await this._mu.lock(p);
    await this._fs.utimes(p, atime, mtime, cred);
    this._mu.unlock(p);
  }

  public utimesSync(p: string, atime: Date, mtime: Date, cred: Cred): void {
    if (this._mu.isLocked(p)) {
      throw new Error('invalid sync call');
    }
    return this._fs.utimesSync(p, atime, mtime, cred);
  }

  public async link(
    srcpath: string,
    dstpath: string,
    cred: Cred,
  ): Promise<void> {
    await this._mu.lock(srcpath);
    await this._fs.link(srcpath, dstpath, cred);
    this._mu.unlock(srcpath);
  }

  public linkSync(srcpath: string, dstpath: string, cred: Cred): void {
    if (this._mu.isLocked(srcpath)) {
      throw new Error('invalid sync call');
    }
    return this._fs.linkSync(srcpath, dstpath, cred);
  }

  public async symlink(
    srcpath: string,
    dstpath: string,
    type: string,
    cred: Cred,
  ): Promise<void> {
    await this._mu.lock(srcpath);
    await this._fs.symlink(srcpath, dstpath, type, cred);
    this._mu.unlock(srcpath);
  }

  public symlinkSync(
    srcpath: string,
    dstpath: string,
    type: string,
    cred: Cred,
  ): void {
    if (this._mu.isLocked(srcpath)) {
      throw new Error('invalid sync call');
    }
    return this._fs.symlinkSync(srcpath, dstpath, type, cred);
  }

  public async readlink(p: string, cred: Cred): Promise<string> {
    await this._mu.lock(p);
    const linkString = await this._fs.readlink(p, cred);
    this._mu.unlock(p);
    return linkString;
  }

  public readlinkSync(p: string, cred: Cred): string {
    if (this._mu.isLocked(p)) {
      throw new Error('invalid sync call');
    }
    return this._fs.readlinkSync(p, cred);
  }
}
