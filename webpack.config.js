
'use strict'

const path = require('path')
const webpack = require('webpack')
const fs = require('fs')
// 尝试加载本地环境变量配置（不会提交到仓库）
try {
  const envLocalPath = path.resolve(__dirname, 'config/env.local.js')
  if (fs.existsSync(envLocalPath)) {
    const localEnv = require(envLocalPath)
    if (localEnv && typeof localEnv === 'object') {
      Object.keys(localEnv).forEach(k => {
        if (process.env[k] == null) process.env[k] = localEnv[k]
      })
    }
  }
} catch (e) {
  console.warn('[env.local] 加载失败:', e && e.message)
}
// 供 devServer 代理使用的 API 目标地址
const DEV_API_TARGET = process.env.DEV_API_TARGET || 'http://localhost:7001'

const chalk = require('chalk')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')
const WatchMissingNodeModulesPlugin = require('./scripts/lib/WatchMissingNodeModulesPlugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const CssUrlRelativePlugin = require('css-url-relative-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const getCSSModuleLocalIdent = require('./scripts/lib/getCSSModuleLocalIdent')
const { getClientEnvironment, getEnv } = require('./scripts/lib/env')
const { overwriteAppPaths, getAppEntry, getRule, resolveAlias, getRuntimeNamespace, getBuilder } = require('./scripts/lib/helper')
const pathsConfig = require('./scripts/lib/paths')
let babelConfig = require('./scripts/lib/babelConfig')

// 公开路径 (去除头部 '/')
const publicUrl = ''
// 当前应用的环境变量
const env = getClientEnvironment(publicUrl)

module.exports = options => {
  // -------------------------------------------------------------------- //
  //                               基础配置                                //
  // -------------------------------------------------------------------- //
  options = Object.assign(options, getBuilder());
  const paths = overwriteAppPaths(pathsConfig, options.paths)
  const pkg = require(paths.appPackageJson)
  const doExtractCss = !(options.umd || (options.feature && options.feature.inlineCss))
  const allowBabelrc = !!(options.feature && options.feature.allowBabelrc)
  const populateFinalBabelConfig = (babelConfig) => ({ ...babelConfig, babelrc: allowBabelrc })
  const getStyleLoader = function (cssOptions, preProcessor) {
    const result = [
      !doExtractCss && require.resolve('style-loader'),
      require.resolve('css-modules-typescript-loader'),
      {
        loader: require.resolve('css-loader'),
        options: cssOptions
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          postcssOptions: {
            config: false,
            plugins: [
              'postcss-flexbugs-fixes',
              'postcss-nested',
              {'postcss-preset-env': {
                browsers: [
                  '>1%',
                  'last 4 versions',
                  'Firefox ESR',
                  'not ie < 9' // React doesn't support IE8 anyway
                ],
                autoprefixer: {
                  flexbox: 'no-2009'
                },
                stage: 3
              }}
            ]
          }
        }
      },
      preProcessor
    ].filter(Boolean)
    return result
  }
  const runtimeNamespace = getRuntimeNamespace(getEnv())
  // 标准配置
  const config = {
    mode: env.raw.NODE_ENV,
    entry: getAppEntry(paths.appSrc, options.entry, options.commons, options.feature),
    context: paths.appSrc,
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: '[name].bundle.js',
      publicPath: env.raw.NODE_ENV === 'production' ? '/chaos-blade/' : '/',
      devtoolModuleFilenameTemplate: info => path.relative(paths.appSrc, info.absoluteResourcePath).replace(/\\/g, '/')
    },
    devServer: {
      historyApiFallback: true,
      open: true,
      hot: true,
      port: 8083,
      client: { overlay: { errors: false, warnings: false } },
      proxy: {
        // XFlow API 代理配置 (更具体的规则放在前面)
        '/api/xflow': {
          target: 'http://localhost:8106',
          pathRewrite: {'^/api/xflow' : '/api/xflow'},
          changeOrigin: true,
        },
        // 通用 API 代理配置
        '/api': {
          target: DEV_API_TARGET,
          pathRewrite: {'^/api' : ''},
        }
      }
    },
    resolve: {
      // 模块查找顺序:
      // - node_modules
      // - {app}/node_modules
      // - global path
      modules: ['node_modules', paths.appNodeModules].concat(
        process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
      ),
      // 支持的扩展名
      extensions: ['.mjs', '.js', '.json', '.jsx', '.ts', '.tsx', '.json'],
      // 应用模块别名
      alias: Object.assign({
        'babel-runtime': '@babel/runtime-corejs2',
        'react-dom/client': path.resolve(__dirname, './src/shims/react-dom-client-shim.js')
      }, resolveAlias(paths.appDir, options.alias || {})),
      plugins: [
        // 限制 src 目录以外的文件引用 (允许引用 package.json)
        new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson])
      ]
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          // 使用 oneOf, 会依次配置 loader, 如果未匹配到的会默认使用最后的 asset
          oneOf: [
            // 加载图片
            {
              id: 'image',
              test: /\.(svg|bmp|gif|png|jpe?g)$/,
              type: 'asset',
              parser: {
                dataUrlCondition: {
                  maxSize: 10 * 1024 // 10kb
                }
              },
              generator: {
                filename: '[name].[hash:8].[ext]'
              }
            },
            // 加载 js
            {
              id: 'js',
              test: /\.(js|jsx|mjs|ts|tsx)$/,
              loader: require.resolve('babel-loader'),
              exclude: /node_modules/,
              include: [
                paths.appSrc,
                /@ali\/wind-rc-/,
                /@alicloud\/console-components-/
              ], // wind业务组件加入转译，官方转译的版本会把wind组件全量打进来，这样就前功尽弃了
              options: populateFinalBabelConfig(babelConfig)
            },
            // 支持引用 html 模板
            {
              id: 'html',
              test: /\.(html|htm|tpl)$/,
              loader: require.resolve('html-loader')
            },
            { test: /\.css$/,
              include: path.resolve(__dirname, './src'),
              // exclude: /node_modules/,
              use: [
                { loader: "style-loader" },  // to inject the result into the DOM as a style block
                'css-modules-typescript-loader',  // to generate a .d.ts module next to the .scss file (also requires a declaration.d.ts with "declare modules '*.scss';" in it to tell TypeScript that "import styles from './styles.scss';" means to load the module "./styles.scss.d.td")
                {
                  loader: "css-loader",
                  options: {
                    modules: {
                      localIdentName: "[name]__[local]__[hash:base64:5]",
                    },
                    // importLoaders: 1,
                  }
                },  // to convert the resulting CSS to Javascript to be bundled (modules:true to rename CSS classes in output to cryptic identifiers, except if wrapped in a :global(...) pseudo class)
                {
                  loader: 'postcss-loader',
                },
              ]
            },
            { test: /\.css$/,
              include: /node_modules/,
              use: [ 'style-loader', 'css-loader', 'postcss-loader' ]
            },
            // src/*.css -> css module
            // {
            //   id: 'css',
            //   test: /\.css$/,
            //   include: path.appSrc,
            //   exclude: /\/node_modules\//,
            //   resourceQuery: /css_modules/,
            //   use: getStyleLoader({
            //     importLoaders: 1,
            //     modules: {
            //       getLocalIdent: getCSSModuleLocalIdent,
            //       exportLocalsConvention: 'camelCase'
            //     }
            //   })
            // },
            // // ./node_modules/*.css -> 全局css
            // // 没有被上面 css 匹配上的 src/*.css -> 全局css
            // {
            //   id: 'css1',
            //   test: /\.css$/,
            //   use: getStyleLoader({
            //     importLoaders: 1
            //   })
            // },
            {
              id: 'less',
              test: /\.less$/,
              use: getStyleLoader({
                importLoaders: 1,
                modules: true
              },
              require.resolve('less-loader'))
            },
            {
              id: 'scss',
              test: /\.scss$/,
              use: getStyleLoader({
                importLoaders: 1,
                modules: true
              },
              require.resolve('sass-loader'))
            },
            // source-map-loader 存在 bug，在处理模块路径时会出现 warning 提示
            // {
            //   id: 'source-map',
            //   test: /\.js$/,
            //   loader: require.resolve('source-map-loader'),
            //   enforce: 'pre',
            //   exclude: /\/node_modules\//
            // },
            // 默认的 loader
            {
              id: 'default',
              exclude: [/\.(js|jsx|mjs|ts|tsx)$/, /\.html$/, /\.json$/],
              type: 'asset/resource',
              generator: {
                filename: '[name].[hash:8].[ext]'
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin(env.stringified),
      // webpack4抽取css文件
      doExtractCss && new MiniCssExtractPlugin({
        filename: '[name].css',
        ignoreOrder: true
      }),
      new CssUrlRelativePlugin(),
      // 显示构建进度
      new ProgressBarPlugin(),
      // 处理路径大小写问题
      new CaseSensitivePathsPlugin(),
      // 监视缺失的模块
      new WatchMissingNodeModulesPlugin(paths.appNodeModules),
      // 处理 .locale 文件
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/
      }),
      // typescript lint 检查 - 暂时在生产构建时禁用以避免构建失败
      ...(env.raw.NODE_ENV !== 'production' ? [new ForkTsCheckerWebpackPlugin({
        typescript: { configFile: paths.appTsConfig },
        async: true,
        // issue: { severity: 'warning' } // 把 TS 问题降级为 warning
      })] : []),
      new HtmlWebpackPlugin({
        title: 'Chaos 社区',
        template: path.resolve(__dirname, './public/index.html'),
        filename: 'index.html',
      }),
    ].filter(Boolean),
    // 注入空 node 模块
    node: {
      global: true,
      __filename: false,
      __dirname: false
    },
    // 关闭性能提示
    performance: {
      hints: false
    },
    // 定义 sourcemap 配置
    devtool: 'cheap-module-source-map',
    // 自定义externals
    externals: Object.assign({}, options.externals),
    optimization: {
      chunkIds: 'natural',
      usedExports: true  // 不导出未使用的代码
    },
    // https://webpack.js.org/configuration/experiments
    experiments: Object.assign({
      topLevelAwait: true,
      lazyCompilation: env.raw.NODE_ENV === 'production' ? false : {
        imports: false, // disable lazy compilation for dynamic imports
        entries: false // disable lazy compilation for entries
      },
      asyncWebAssembly: true,
      syncWebAssembly: true
    }, options.experiments)
  }

  // -------------------------------------------------------------------- //
  //                               可选配置                                //
  // -------------------------------------------------------------------- //

  // 如果开启 profile
  if (options.profile) {
    console.log(chalk.cyan('INFO:'), '已开启 profile (webpack bundle analyze)')
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    config.plugins.push(
      new BundleAnalyzerPlugin()
    )
  }

  // optimization非空设定，优化配置写入
  // if (!config.optimization) config.optimization = {}

  // 如果支持 commons
  if (options.commons) {
    console.log(chalk.cyan('INFO:'), '已启动 splitChunks 公共模块支持')

    // eg. react, react-dom等公共模块，这里(_)和@是为为了以下格式：
    // react@15.x, _react@15.x
    const arrCommons = [].concat(options.commons)
    const regCommon = new RegExp(`[\\/]node_modules[\\/](_)?(${arrCommons.join('|')})[\\/|@]`)

    config.optimization = {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: regCommon,
            name: 'common',
            chunks: 'all'
          }
        }
      }
    }
  }

  // 构建特性支持
  if (options.feature) {
    // 如果允许编译依赖中的 JS
    if (options.feature.compileDeps) {
      const rule = getRule(config.module.rules[0].oneOf, 'js')

      // 删除 include, 允许编译依赖
      delete rule.include
    }

    if (options.feature.cssSplit) {
      console.log(chalk.cyan('INFO:'), '已启动 IE9 css 文件拆分支持')
      const FastCSSSplitWebpackPlugin = require('fast-css-split-webpack-plugin')

      config.plugins.push(
        new FastCSSSplitWebpackPlugin({
          size: 4000,
          imports: true,
          preserve: true
        })
      )
    }

    // 是否打成fmd，用于work工作台的情况
    if (options.feature.fmd) {
      const { name } = pkg
      if (!name) {
        console.error(chalk.red('已开启fmd构建，package.json需要指定name字段！'))
        return
      }

      // libraryTarget修改成amd
      config.output.library = name
      config.output.libraryTarget = 'amd'

      // 配置fmd插件
      require('@ali/webpack-fmd-plugin')

      const entryKeys = Object.keys(config.entry)
      console.log(chalk.cyan('INFO:'), `已对下列入口开启fmd构建：\n${JSON.stringify(entryKeys)}`)
    }
  }

  // 如果是 production 模式
  console.log(chalk.cyan('INFO:'), `当前构建模式为 ${process.env.NODE_ENV} 模式`)
  if (env.raw.NODE_ENV === 'production') {
    const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
    // const ESBuildWebpackPlugin = require('esbuild-webpack-plugin').default

    config.optimization.chunkIds = 'deterministic'
    config.optimization.minimize = true
    /**
     * Or customize ESBuild options like below:
     *
     * new ESBuildPlugin({target: "es5"}),
     *
     * For details, please refer: https://github.com/evanw/esbuild
     */
    // config.optimization.minimizer = [new ESBuildWebpackPlugin({target: 'es6'})]

    // 添加 CSS 压缩
    config.plugins.push(
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessorOptions: {
          discardComments: {
            removeAll: true
          },
          autoprefixer: false,
          zindex: false
        },
        canPrint: true
      })
    )

    // 设置性能提示
    config.performance = {}
  }

  // 删除掉所有 loader 上的 id
  for (const item of config.module.rules[0].oneOf) {
    delete item.id
  }
  // 开启资源本地化
  if (process.env.LOCAL_ENV) {
    if (env.raw.NODE_ENV === 'production') {
      // config.output.path = config.output.path + config.output.publicPath
      // 将静态资源下载到项目内插件
      const WebpackResourceLocalizePlugin = require('@ali/webpack-resource-localize-plugin')
      config.plugins.unshift(new WebpackResourceLocalizePlugin({ // 这里存在耦合，不能随意调整顺序
        // destDir: 'build' + config.output.publicPath,
        contextPath: config.output.publicPath
      }))
    }
  }

  // 开启私有化
  if (process.env.INNER_ENV) {
    const etx = process.env.INNER_ENV === 'true' ? 'inner' : process.env.INNER_ENV
    // 私有化编译时，优先导入 .inner.* 的文件
    config.resolve.extensions = config.resolve.extensions.map(v => `.${etx}${v}`).concat(config.resolve.extensions)
  }

  // 微前端时调用插件
  if (process.env.MICRO_ENV) {
    const WepbackChain = require('webpack-chain')
    const { chainOsWebpack } = require('@alicloud/console-toolkit-plugin-os')
    const { merge } = require('webpack-merge')

    const chain = new WepbackChain()
    // consoleOS 插件
    const appId = runtimeNamespace.namespace.split('/').filter(v => v)[1]
    chainOsWebpack({
      id: appId,
      webpack5: true,
      disableOsCssExtends: true
    })(chain)
    const _config = merge(config, chain.toConfig());
    return _config
  }
  return config
}
