'use strict'

module.exports = {
  babelrc: false,
  compact: false,
  cacheDirectory: true,
  presets: [
    [require.resolve('@babel/preset-env'), { modules: 'umd' }], // 处理 es6+ 规范语法的插件集合
    require.resolve('@babel/preset-typescript'), // 处理 typescript 语法的插件集合
    require.resolve('@babel/preset-react') // 处理 react 语法的插件集合
  ],
  plugins: [
    // 第一个插件必须是transform-runtime，有其它地方会直接使用plugins[0]的方式改一些配置
    // 关闭 babel 自带的 polyfill 和 RegeneratorRuntime，使用autoPolyfill
    // 已配置使用auto polyfill服务
    [require.resolve('@babel/plugin-transform-runtime'), { // 自动引入helper
      'corejs': 2, // 隔离变量作用域
      'regenerator': false,
      // 'polyfill': false,
      'helpers': true,
      'useESModules': true
    }],

    // stage 0 设想（Strawman）
    require.resolve('@babel/plugin-proposal-function-bind'),

    // stage 1 建议（Proposal）
    require.resolve('@babel/plugin-proposal-export-default-from'),
    require.resolve('@babel/plugin-proposal-logical-assignment-operators'),
    [require.resolve('@babel/plugin-proposal-optional-chaining'), { 'loose': false }],
    [require.resolve('@babel/plugin-proposal-pipeline-operator'), { 'proposal': 'minimal' }],
    [require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'), { 'loose': false }],
    require.resolve('@babel/plugin-proposal-do-expressions'),

    // stage 2 草案（Draft）
    [require.resolve('@babel/plugin-proposal-decorators'), { 'legacy': true }],
    require.resolve('@babel/plugin-proposal-function-sent'),
    require.resolve('@babel/plugin-proposal-export-namespace-from'),
    require.resolve('@babel/plugin-proposal-numeric-separator'),
    require.resolve('@babel/plugin-proposal-throw-expressions'),

    // css modules 智能识别
    require('./babel-plugin-auto-css-modules'),

    // stage 3 候选（Candidate）
    require.resolve('@babel/plugin-syntax-dynamic-import'),
    require.resolve('@babel/plugin-syntax-import-meta'),
    [require.resolve('@babel/plugin-proposal-class-properties'), { 'loose': false }],
    require.resolve('@babel/plugin-proposal-json-strings'),

    [require.resolve('babel-plugin-import'), { libraryName: '@ali/wind', libraryDirectory: 'lib' }, 'import-for-wind'],
    [require.resolve('babel-plugin-import'), { libraryName: '@alicloud/console-components', libraryDirectory: 'lib' }, 'import-for-alicloud']

  ]
}
