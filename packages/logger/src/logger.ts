import debug from 'debug';

import { LoggerLevel } from './i';
import type { Transport, TransportOptions, TransportSynth } from './transport';

export interface LoggerOptions {
  /**
   * Log level, logs below this level will not be displayed.
   */
  level?: LoggerLevel;
  timestamp?: boolean;
  enableWorker?: boolean;
  /**
   * Logs transports will not be enabled when debug: true
   */
  debug?: boolean;
  transports: TransportSynth[];
  /**
   * @default 'default‘
   */
  namespace?: string;
}

/**
 * Messages only support data that can be structurally cloned
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types}
 *
 * @example
 * ```ts
 * const logger = Logger.create({
 *   transports: [
 *      createTransport(IndexedDBTransport, {})
 *   ]
 * });
 *
 * ```
 *
 */
export class Logger {
  private readonly _debug: debug.Debugger;
  private readonly _options: LoggerOptions;
  private readonly _transports = new Set<InstanceType<typeof Transport>>();
  private static _logger: Logger;

  static create(options?: LoggerOptions) {
    if (!this._logger) {
      this._logger = new Logger(options);
    }

    return this._logger;
  }

  private constructor(options?: LoggerOptions) {
    this._options = Object.assign(
      {},
      { transports: [], namespace: 'default', enableWorker: true },
      options,
    );
    this._debug = debug(this._options.namespace);

    for (const { transport, options } of this._options.transports) {
      const opt: TransportOptions = Object.assign({}, this._options, options);
      if (transport) {
        const instance: Transport = new transport({
          namespace: opt.namespace,
          enableWorker: opt.enableWorker,
        });
        if (opt.enableWorker && instance.background) {
          const workerScript = instance.background();
          const worker = new SharedWorker(workerScript.url, {
            name: 'publish-logger-v1-' + workerScript.url,
          });
          instance.worker = worker;
          worker.port.start();

          worker.port.addEventListener('message', (e) => {});
          worker.port.addEventListener('error', (e) => {});
        }

        this._transports.add(instance);
      }
    }
  }

  public set enabled(enabled: boolean) {
    this._debug.enabled = enabled;
  }

  public get enabled() {
    return this._debug.enabled;
  }

  private async log(
    level: LoggerLevel,
    message: any,
    options: TransportOptions,
    ...args: any[]
  ) {
    console.log(LoggerLevel[level]);
    this._debug.log = console[LoggerLevel[level]].bind(console);
    this._debug(`[${LoggerLevel[level]}] ${message}`, ...args);

    for await (const transport of this._transports) {
      const opt: TransportOptions = Object.assign(
        {},
        transport.getOptions(),
        options,
      );

      const content = {
        message,
        level,
        namespace: opt.namespace,
        timestamp: '',
      };

      transport.handle(content);
    }
  }

  public debug(message: any, options?: any, ...args: any[]) {
    this.log(LoggerLevel.debug, message, options, ...args);
  }

  public info(message: any, options?: any, ...args: any[]) {
    this.log(LoggerLevel.info, message, options, ...args);
  }

  public warn(message: any, options?: any, ...args: any[]) {
    this.log(LoggerLevel.warn, message, options, ...args);
  }

  public error(message: any, options?: any, ...args: any[]) {
    this.log(LoggerLevel.error, message, options, ...args);
  }

  /**
   * Delete all logs from storage by namespace;
   */
  public grind() {}

  public async dispose() {
    for await (const t of this._transports) {
      await t.dispose();
    }
    this._transports.clear();
  }
}
