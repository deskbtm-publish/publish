import * as babel from '@babel/core';
import BabelPluginReactCompiler from 'babel-plugin-react-compiler';
import type webpack from 'webpack';

export const reactCompilerLoader = async function (
  this: webpack.LoaderContext<any>,
  content: string,
) {
  const callback = this.async();

  try {
    const { babelPlugins, ...reactCompilerConfig } = this.getOptions();

    const result = await babel.transformAsync(content, {
      sourceFileName: this.resourcePath,
      filename: this.resourcePath,
      plugins: [
        [BabelPluginReactCompiler, reactCompilerConfig],
        ...babelPlugins,
      ],
      generatorOpts: {
        jsescOption: {
          minimal: true,
        },
      },
      cloneInputAst: false,
      ast: false,
      sourceMaps: true,
      configFile: false,
      babelrc: false,
    });

    if (!result) {
      callback(new TypeError(`Babel failed to transform ${this.resourcePath}`));
      return;
    }

    const { code, map } = result;
    callback(null, code ?? undefined, map ?? undefined);
  } catch (e) {
    callback(e);
  }
};
