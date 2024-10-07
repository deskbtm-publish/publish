import '@deskbtm/gadgets/env';

import path from 'node:path';

import { kMode } from '@deskbtm/gadgets/env';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
// import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { type Configuration, DefinePlugin, ProgressPlugin } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { getEnvironment } from './env';
import {
  __project,
  __rootProject,
  InternalConfiguration,
  require,
} from './utils';

declare global {
  const kReleaseMode: string;
}
// Exclude source map to reduce Tauri bundle size.
kMode('release', process.env.RELEASE!, 'true');

function getStyleLoaders(cssOptions: any) {
  return [
    kDevMode
      ? {
          loader: require.resolve('style-loader'),
        }
      : {
          loader: MiniCssExtractPlugin.loader,
        },
    {
      loader: require.resolve('css-loader'),
      options: cssOptions,
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        postcssOptions: {
          config: path.resolve(__dirname, './postcss.config.cjs'),
        },
      },
    },
  ];
}

const swcOptions = {
  // https://swc.rs/docs/configuring-swc/
  jsc: {
    preserveAllComments: true,
    parser: {
      syntax: 'typescript',
      dynamicImport: true,
      topLevelAwait: false,
      tsx: true,
      decorators: true,
    },
    target: 'es2022',
    externalHelpers: false,
    transform: {
      react: {
        runtime: 'automatic',
        refresh: kDevMode && {
          refreshReg: '$RefreshReg$',
          refreshSig: '$RefreshSig$',
          emitFullSignatures: true,
        },
      },
      useDefineForClassFields: false,
    },
  },
};

/**
 * buildMode is used for bundle
 * envMode is used for environment, eg buildMode=production to minify the code
 * envMode=development to test.
 *
 * @returns
 */
export function createConfiguration({
  reactCompiler,
}: InternalConfiguration): Configuration {
  const kEnvMode = process.env.NODE_ENV as Configuration['mode'];
  const publicPath = process.env.PUBLIC_PATH ?? '/';

  const env = getEnvironment();

  const output = {
    environment: {
      module: true,
      dynamicImport: true,
    },
    filename: (_) => {
      return 'js/[name].js';
    },
    //[contenthash] optimizes the browser cache.
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'assets/[name].[contenthash:8].[ext][query]',
    devtoolModuleFilenameTemplate:
      'webpack://[namespace]/[resource-path]?[loaders]',
    hotUpdateChunkFilename: 'hot/[id].[fullhash].js',
    hotUpdateMainFilename: 'hot/[runtime].[fullhash].json',
    path: path.resolve(__project, 'dist'),
    // Remove dist before build in production.
    clean: kProdMode,
    globalObject: 'globalThis',
    publicPath,
  } satisfies Configuration['output'];

  const optimization = {
    minimize: kProdMode,
    runtimeChunk: false,
    minimizer: [
      '...' as const,
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
        parallel: true,
        extractComments: false,
        terserOptions: {
          ecma: 2020,
          compress: {
            unused: true,
          },
          mangle: true,
        },
      }),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {
            encodeOptions: {
              jpeg: {
                // https://sharp.pixelplumbing.com/api-output#jpeg
                quality: 100,
              },
              webp: {
                // https://sharp.pixelplumbing.com/api-output#webp
                lossless: true,
              },
              avif: {
                // https://sharp.pixelplumbing.com/api-output#avif
                lossless: true,
              },
              // png by default sets the quality to 100%, which is same as lossless
              // https://sharp.pixelplumbing.com/api-output#png
              png: {},

              // gif does not support lossless compression at all
              // https://sharp.pixelplumbing.com/api-output#gif
              gif: {},
            },
          },
        },
      }),
      new CssMinimizerPlugin(),
    ].filter(Boolean),
    removeEmptyChunks: true,
    providedExports: true,
    usedExports: true,
    sideEffects: true,
    removeAvailableModules: true,
    splitChunks: {
      chunks: 'all',
      minSize: 1,
      minChunks: 1,
      maxInitialRequests: Number.MAX_SAFE_INTEGER,
      maxAsyncRequests: Number.MAX_SAFE_INTEGER,
      cacheGroups: {
        styles: {
          name: 'styles',
          type: 'css/mini-extract',
          chunks: 'all',
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    },
  } satisfies Configuration['optimization'];

  const module = {
    parser: {
      // https://webpack.js.org/configuration/module/#ruleparser
      javascript: {
        node: false,
        requireJs: false,
        import: true,
        exportsPresence: 'error',
      },
    },
    rules: [
      {
        // Disable esm module needs file extension
        test: /\.m?js?$/,
        resolve: {
          fullySpecified: false,
        },
      },
      // {
      //   enforce: 'pre',
      //   test: /\.(js|mjs|jsx|ts|tsx|css)$/,
      //   loader: require.resolve('source-map-loader'),
      // },
      {
        test: /\.(js|mjs|cjs|cts|mts|ts)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('swc-loader'),
            options: swcOptions,
          },
        ],
      },
      {
        test: /\.(jsx|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('swc-loader'),
            options: swcOptions,
          },
          reactCompiler && {
            loader: require.resolve('react-compiler-loader'),
            options: {
              babelPlugins: [
                '@babel/plugin-syntax-jsx',
                ['@babel/plugin-syntax-typescript', { isTSX: true }],
              ],
            },
          },
        ].filter(Boolean),
      },

      {
        oneOf: [
          {
            test: /\.svg$/,
            use: [
              {
                loader: require.resolve('@svgr/webpack'),
                options: {
                  prettier: false,
                  svgo: false,
                  svgoConfig: {
                    plugins: [{ removeViewBox: false }],
                  },
                  titleProp: true,
                  ref: true,
                },
              },
              {
                loader: require.resolve('file-loader'),
                options: {
                  name: 'assets/[name].[contenthash:8].[ext]',
                },
              },
            ],
            issuer: {
              and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
            },
          },
          {
            test: /\.(png|jpg|gif|svg|webp|mp4)$/,
            type: 'asset/resource',
          },
          {
            test: /\.(ttf|eot|woff|woff2)$/,
            type: 'asset/resource',
          },
          {
            test: /\.css$/,
            exclude: /\.module\.css$/,
            use: getStyleLoaders({
              sourceMap: false,
              modules: false,
              importLoaders: 1,
            }),
          },
          {
            test: /\.module\.css$/,
            use: getStyleLoaders({
              sourceMap: false,
              esModule: true,
              modules: {
                auto: true,
                localIdentName: '[name]__[local]--[hash:base64:8]',
              },
              importLoaders: 2,
            }),
          },
          {
            // Exclude `js` files to keep "css" loader working as it injects
            // its runtime that would otherwise be processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
            type: 'asset/resource',
          },
        ],
      },
    ],
  } satisfies Configuration['module'];

  const plugins = [
    !kDevMode &&
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: 'css/[name].[contenthash:8].css',
        chunkFilename: 'css/[name].[contenthash:8].chunk.css',
      }),
    new ProgressPlugin({ percentBy: 'entries' }),
    // new webpack.optimize.LimitChunkCountPlugin({
    //   maxChunks: 1,
    // }),
    // new NodePolyfillPlugin(),
    kDevMode && new CaseSensitivePathsPlugin(),
    kDevMode &&
      new ReactRefreshWebpackPlugin({ overlay: false, esModule: true }),
    new DefinePlugin(env.stringified),
    // Only triggered when building web.
    kProdMode &&
      process.env.PUBLISH_BUILD_PLATFORM === 'web' &&
      new BundleAnalyzerPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__project, 'public'),
          to: path.resolve(__project, 'dist'),
        },
      ],
    }),
  ].filter(Boolean) satisfies Configuration['plugins'];

  const experiments = {
    topLevelAwait: true,
    outputModule: false,
    syncWebAssembly: true,
  } satisfies Configuration['experiments'];

  const resolve = {
    symlinks: true,
    extensions: ['.mjs', '.js', '.ts', '.tsx', '.json', '.jsx'],
  } satisfies Configuration['resolve'];

  const cache = {
    type: 'filesystem',
    version: env.hash,
    store: 'pack',
    maxAge: 1e5,
    buildDependencies: {
      defaultWebpack: ['webpack/lib/'],
      config: [__filename],
    },
  } satisfies Configuration['cache'];

  return {
    mode: kEnvMode,
    target: ['web', 'es5'],
    output,
    resolve,
    devtool: kProdMode
      ? kReleaseMode
        ? false
        : 'source-map'
      : 'eval-cheap-module-source-map',
    optimization,
    module,
    context: __project,
    plugins,
    cache,
    experiments,
  };
}
