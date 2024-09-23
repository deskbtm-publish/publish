import { is } from '@deskbtm/gadgets/is';
import type { HTMLAttributeReferrerPolicy } from 'react';
import { v4 } from 'uuid';

import { message } from './message';
import { presetEnvScript } from './presets';

export interface GraphicalSandboxOptions {}
// https://stackoverflow.com/questions/15942872/maximum-number-of-iframe-tagsper-web-page

export interface SandboxOptions {
  /**
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#sandbox}
   * @defaultValue
   * ```ts
   * ['allow-scripts']
   * ```
   * @example
   * ```
   * [
   * 'allow-scripts'
   * 'allow-popups',
   * 'allow-downloads',
   * 'allow-forms',
   * 'allow-modals',
   * 'allow-orientation-lock',
   * 'allow-pointer-lock',
   * ]
   * ```
   */
  grants?: string[];
  /**
   *@see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#allow}
   *@see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Permissions_Policy#embedded_frame_syntax}
   */
  allows?: string[];
  /**
   * Part of iframe attributes.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
   */
  iframeProps?: {
    referrerpolicy?: HTMLAttributeReferrerPolicy;
    allowfullscreen?: boolean;
    allowpaymentrequest?: boolean;
    csp?: string;
  };

  /**
   * graphical sandbox that can render html.
   * @defaultValue `false`
   */
  graphical?: boolean;
}

/**
 *
 *
 * @example
 * ```ts
 * const script = await res.text();
 * const sandbox = new Sandbox();
 * sandbox.run(script);
 *
 * sandbox.addEventListener('load', ()=>{
 *  sandbox.postMessage('custom-event', {test:1})
 * })
 *
 * sandbox.addEventListener('error', (e) => {
 *  console.log(`Error Sandbox ${sandbox.id}: `, e);
 * });
 *
 * sandbox.addEventListener('manifest',(e) => {},{ once: true },);
 * ```
 */
export class Sandbox extends EventTarget {
  private _iframe!: HTMLIFrameElement;
  /**
   * Sandbox id, plugin can get it by `window.__SID__`
   */
  public id!: string;
  private readonly _options: SandboxOptions;
  private readonly _eventsMap = new Map<(e: any) => void, string>();

  constructor(readonly options?: SandboxOptions) {
    super();
    this._options = Object.assign<object, SandboxOptions, SandboxOptions>(
      {},
      {
        grants: ['allow-scripts'],
        graphical: false,
        iframeProps: {},
      },
      options!,
    );
    this._init();
  }

  private _init() {
    this.id = v4();
    this._iframe = document.createElement('iframe');
    this._iframe.setAttribute('sandbox', this._options.grants!.join(' '));
    this._iframe.setAttribute('allowfullscreen', 'true');
    this._iframe.setAttribute('id', this.id);

    for (const [key, value] of Object.entries(this._options.iframeProps!)) {
      this._iframe.setAttribute(key, `${value}`);
    }
    if (!this._options.graphical) {
      this._iframe.style.display = 'none';
    }

    document.body.appendChild(this._iframe);
  }

  public run(script: string) {
    const html = /*html*/ `<!DOCTYPE html>
<html>
<head></head>
<body>
  <script type='text/javascript'>
    ${presetEnvScript({ id: this.id })}
  </script>
  <script>${script}</script>
</body>
</html>    
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    this._iframe.src = url;
    this._iframe.addEventListener('load', this._handleLoad);
  }

  private _handleLoad = () => {
    const event = new CustomEvent('load');
    this.dispatchEvent(event);
  };

  public getInstance() {
    return document.getElementById(this.id) as HTMLIFrameElement;
  }

  /**
   * Built-in events `error`,`load`
   */
  public override addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void {
    const listener = (e: MessageEvent<any>) => {
      const data = e.data;
      if (data) {
        try {
          // https://web.dev/articles/sandboxed-iframes#safely_sandboxing_eval
          if (data.event === type) {
            this.dispatchEvent(new CustomEvent(type, { detail: data }));
          }
        } catch (error) {
          /* empty */
        }
      }
    };
    // Ignore once.
    if (!(is.object(options) && options.once)) {
      this._eventsMap.set(listener, type);
    }
    window.addEventListener('message', listener);
    super.addEventListener(type, callback, options);
  }

  /**
   * Transferable objects
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects#supported_objects}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types}
   */
  public postMessage(
    type: string,
    content: unknown,
    options?: WindowPostMessageOptions,
  ) {
    options = Object.assign({}, { targetOrigin: '*' }, options);
    this._iframe.contentWindow?.postMessage(message(type, content), options);
  }

  public dispose() {
    this._iframe.parentNode?.removeChild(this._iframe);
    this._eventsMap.forEach((value, key) => {
      window.removeEventListener(value, key);
    });
    this._eventsMap.clear();
    URL.revokeObjectURL(this._iframe.src);
  }
}
