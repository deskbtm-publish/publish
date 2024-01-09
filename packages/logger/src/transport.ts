import type { Clz, LogLevel } from './i';

export interface TransportOptions {
  namespace: string;
}

export interface TransportContent {
  timestamp: string;
  message: unknown;
  level: LogLevel;
  namespace: string;
}

export abstract class Transport {
  constructor(options?: TransportOptions) {
    options = Object.assign({}, { useStorage: true }, options);
  }

  abstract write(content: TransportContent): Promise<void> | void;

  abstract dispose(): Promise<void> | void;

  abstract grindStorage(): Promise<boolean> | boolean;
}

export type TransportSynth = { transport: Clz; options?: TransportOptions };

export function createTransport<T extends Clz>(
  transport: T,
  options?: ConstructorParameters<T>[0],
): TransportSynth {
  return {
    transport,
    options,
  };
}