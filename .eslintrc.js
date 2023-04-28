/* eslint-disable no-undef */
const { compilerOptions } = require('./jsconfig.json');

const aliasPaths = [];

for ([key, value] of Object.entries(compilerOptions.paths)) {
  key = key.split('/').shift();
  value = value[0].substring(1, value[0].length - 2);
  aliasPaths.push([key, `./src${value}`]);
}

module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ['airbnb-base'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'prefer-spread': ['off'],
    'max-len': ['error', { code: 160 }],
    'class-methods-use-this': 'off',
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
    'quotes': [2, "single", { "avoidEscape": true }],
    'indent': ['error', 2],
    'no-multi-spaces': ['error'],
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: true,
      optionalDependencies: false,
      peerDependencies: false,
      packageDir: './',
    }],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: ['case', 'default'], next: '*' },
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
    ],
    'no-param-reassign': false,
    'quotes': [2, "single", { "avoidEscape": true, "allowTemplateLiterals": true}],
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        semi: true,
      }
    ],
  },

  settings: {
    'import/resolver': {
      alias: aliasPaths,
    },
  },
  ignorePatterns: ['src/test/*', 'src/app/views/*', 'src/app/public/*', '*dto.js'],
};
