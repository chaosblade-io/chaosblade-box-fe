module.exports = {
  extends: 'eslint-config-egg/typescript',
  env: {
    browser: true,
  },
  // for experimental features support
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // for es6 module
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'sort-imports-es6-autofix',
  ],
  rules: {
    /**
     * Prevent React to be incorrectly marked as unused
     * @see https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-uses-react.md
     */
    'react/jsx-uses-react': [ 'error' ],

    /**
     * Prevent variables used in JSX to be incorrectly marked as unused
     * @see https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-uses-vars.md
     */
    'react/jsx-uses-vars': 'error',

    /**
     * This rule enforces spacing after the `*` of generator functions, but omitting before that
     * @see http://eslint.org/docs/rules/generator-star-spacing
     */
    'generator-star-spacing': [ 'error', { before: true, after: false }],
    
    /**
     * 这里是因为之前的代码都这么写了，所以off掉
     * @see https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-use-before-define.md
     */
    '@typescript-eslint/no-use-before-define': 'off',

    /**
     * @see https://www.npmjs.com/package/eslint-plugin-sort-imports-es6-autofix
     */
    'sort-imports-es6-autofix/sort-imports-es6': 'off', // 关闭导入排序
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/semi': 'warn', // 分号警告，不阻断
  },
  parserOptions: {
    project: './tsconfig.json',
  },
}
