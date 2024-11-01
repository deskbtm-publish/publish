import path from 'node:path';

import { mkcert } from '@deskbtm/dev-mkcert';
import type { Configuration, ServerOptions } from 'webpack-dev-server';

import { __project } from './utils';

export async function createDevServerConfiguration(): Promise<{
  devServer: Configuration;
}> {
  const host = process.env.HOST || '0.0.0.0';
  const port = Number(process.env.PORT) || 3001;
  const serverProtocol = process.env.PROTOCOL ?? 'https';

  let cert: ServerOptions | undefined;
  if (serverProtocol === 'https') {
    cert = await mkcert({ hosts: [host] });
  }

  return {
    devServer: {
      hot: 'only',
      host,
      port,
      liveReload: true,
      client: {
        overlay: {
          errors: true,
          warnings: false,
          runtimeErrors: true,
        },
      },
      historyApiFallback: true,
      static: {
        directory: path.resolve(__project, 'public'),
        publicPath: '/',
        watch: true,
      },
      server: {
        type: serverProtocol,
        options: cert,
      },
    },
  };
}
