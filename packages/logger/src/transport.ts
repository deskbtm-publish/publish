import type { Clz, LoggerLevel } from './i';
import type { WorkerScript } from './utils';

export interface TransportOptions {
  namespace: string;
  storageVersion: number;
  enableWorker?: boolean;
}

export interface TransportContent {
  timestamp: number;
  message: unknown;
  level: LoggerLevel;
  namespace: string;
}

export abstract class Transport {
  private _worker!: SharedWorker;

  constructor(protected options?: TransportOptions) {
    this.options = Object.assign({}, { enableWorker: true }, options);
  }

  set worker(worker) {
    this._worker = worker;
  }

  get worker() {
    return this._worker;
  }

  getOptions() {
    return this.options;
  }

  abstract handle(content: TransportContent): Promise<void> | void;

  abstract background(options: TransportOptions): WorkerScript;

  dispose(): Promise<void> | void {
    this._worker.port.close();
  }

  abstract grind(namespace: string): Promise<void> | void;
}

export interface TransportSynth {
  transport: Clz;
  options?: TransportOptions;
}

export function createTransport<T extends Clz>(
  transport: T,
  options?: ConstructorParameters<T>[0],
): TransportSynth {
  return {
    transport,
    options,
  };
}
