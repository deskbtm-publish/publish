import HTML from 'html-webpack-plugin';

// webpack.config must be here, otherwise circular dependency
// eslint-disable-next-line simple-import-sort/exports
export * from './webpack.config';
export * from './dev-server.config';
export * from './utils';
export { HTML };
