import 'webpack-dev-server';
import './env';

import { createRequire } from 'node:module';
import path from 'node:path';

import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import { findPackageRoot, findProjectRoot } from 'workspace-tools';

import { createConfiguration } from './base.config';
import { createDevServerConfiguration } from './dev-server.config';

export const __rootProject = findProjectRoot(process.cwd()) as string;
export const __project = findPackageRoot(process.cwd()) as string;

export const resolveRelativeProject = (relativePath: string) =>
  path.resolve(__project, relativePath);

export const require = createRequire(import.meta.url);

export interface InternalConfiguration {
  reactCompiler?: boolean;
}

export interface PublishPackConfiguration
  extends Configuration,
    InternalConfiguration {}

/**
 * Configure webpack
 *
 * @param config
 * ```ts file=publish-pack.config.mjs
 *
 * export default configure({
 *    entry: {
 *      main: './src/main.tsx'
 *    },
 *    plugins: [
 *
 *    ]
 * })
 * ```
 */
export async function configure({
  reactCompiler,
  ...config
}: PublishPackConfiguration) {
  const baseConfig = createConfiguration({ reactCompiler });
  const serverConfig = await createDevServerConfiguration();

  return merge<Configuration>(baseConfig, config, serverConfig);
}
