import eslint from '@eslint/js';
import tslintParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tsEslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactCompiler from 'eslint-plugin-react-compiler';

export default tsEslint.config(
  eslint.configs.recommended,
  ...tsEslint.configs.strict,
  ...tsEslint.configs.stylistic,
  prettierConfig,
  {
    files: ['**/*.{ts,mts,cts,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    ignores: ['**/dist', '**/node_modules', '**/.swc', '**/.yarn', ''],
    languageOptions: {
      parser: tslintParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: [
          './tsconfig.json',
          './first_party/*/tsconfig.json',
          './inactive_third_party/*/tsconfig.json',
          './packages/*/tsconfig.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        myCustomGlobal: 'readonly',
      },
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'no-console': ['error', { allow: ['warn', 'error', 'info', 'debug'] }],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tsEslint.configs.disableTypeChecked,
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: [
      'packages/desktop/**/*.{ts,tsx}',
      'packages/mobile/**/*.{ts,tsx}',
      'packages/shared/**/*.{ts,tsx}',
      'packages/doc-editor/**/*.{ts,tsx}',
      'packages/video-editor/**/*.{ts,tsx}',
    ],
    plugins: {
      react,
      'react-refresh': reactRefresh,
      'react-hooks': reactHooks,
      'react-compiler': reactCompiler,
    },
    languageOptions: {
      ...reactJsxRuntime.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      'react-compiler/react-compiler': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'inline-type-imports',
        },
      ],
      'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: true,
        },
      ],
    },
  },
);
