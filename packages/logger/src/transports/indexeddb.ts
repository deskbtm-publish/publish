import { deleteDB } from 'idb';

import type { TransportContent, TransportOptions } from '../transport';
import { Transport } from '../transport';
import { WorkerScript } from '../utils';

export interface IndexedDBTransportOptions extends TransportOptions {}

export class IndexedDBTransport extends Transport {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(options: IndexedDBTransportOptions) {
    super(options);
  }

  /**
   * Main thread.
   * @param content
   */
  override async handle(content: TransportContent) {
    const worker = this.worker;
    worker.port.postMessage(content);
  }

  /**
   * Background thread
   */
  override background(options: TransportOptions) {
    const { namespace, storageVersion } = options;
    return new WorkerScript(/* js */ `
      const db = await idb.openDB('${namespace}', ${storageVersion}, {
        upgrade(db) {
          const store = db.createObjectStore('default', {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('timestamp', 'timestamp');
        },
      });

      globalThis.addEventListener('connect', (e1)=>{
        const port = e1.ports[0]   
        port.addEventListener('message', async (e2)=>{
          await db.add('default', e2.data);
        })
        port.start();
      })
    `);
  }

  override dispose() {
    super.dispose();
  }

  /**
   * Delete log from storage by namespace;
   */
  override async grind(namespace: string): Promise<void> {
    return deleteDB(namespace);
  }
}
