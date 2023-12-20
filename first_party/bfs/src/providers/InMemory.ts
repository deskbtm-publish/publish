import { CreateProvider, type ProviderOptions } from './provider';
import type {
  SimpleSyncStore,
  SyncKeyValueRWTransaction,
  SyncKeyValueStore,
} from './SyncStore';
import { SimpleSyncRWTransaction, SyncKeyValueFileSystem } from './SyncStore';

/**
 * A simple in-memory key-value store backed by a JavaScript object.
 */
export class InMemoryStore implements SyncKeyValueStore, SimpleSyncStore {
  private store: Map<string, Uint8Array> = new Map<string, Uint8Array>();

  public name() {
    return InMemoryFileSystem.Name;
  }
  public clear() {
    this.store.clear();
  }

  public beginTransaction(type: string): SyncKeyValueRWTransaction {
    return new SimpleSyncRWTransaction(this);
  }

  public get(key: string): Uint8Array {
    return this.store.get(key)!;
  }

  public put(key: string, data: Uint8Array, overwrite: boolean): boolean {
    if (!overwrite && this.store.has(key)) {
      return false;
    }
    this.store.set(key, data);
    return true;
  }

  public del(key: string): void {
    this.store.delete(key);
  }
}

/**
 * A simple in-memory file system backed by an InMemoryStore.
 * Files are not persisted across page loads.
 */
export class InMemoryFileSystem extends SyncKeyValueFileSystem {
  public static override readonly Name = 'InMemory';

  public static Create = CreateProvider.bind(this);

  public static readonly Options: ProviderOptions = {};

  public constructor() {
    super({ store: new InMemoryStore() });
  }
}
