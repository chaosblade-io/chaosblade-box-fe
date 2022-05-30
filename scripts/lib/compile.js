'use strict'

const path = require('path')
const webpack = require('webpack')
const chalk = require('chalk')
const moment = require('moment')

moment.locale('zh-cn')

function getConfig (basedir, opts) {
  let webpackConfig = require('./webpack.config')(opts)

  let configOverrides
  try {
    configOverrides = require(path.join(basedir, 'config-overrides.js'))
  } catch (e) {
    console.log(e)
  }
  // 必须返回1个function
  if (typeof configOverrides === 'function') {
    webpackConfig = configOverrides(webpackConfig)
  }

  // 打印 publicPath 和 构建入口
  console.log(chalk.cyan('INFO:'), '当前 publicPath 为: ' + webpackConfig.output.publicPath)
  console.log(chalk.cyan('INFO:'), '当前构建入口规则 =>', JSON.stringify(webpackConfig.entry, null, 2))

  return webpackConfig
}

function compile (basedir, type, opts) {
  opts = opts || {}

  // 如果是 profile, 就开启 profile 选项
  if (type === 'profile') {
    opts.profile = true
  }

  const compiler = webpack(getConfig(basedir, opts))

  return new Promise((resolve, reject) => {
    try {
      const callback = (err, stats) => {
        if (err) {
          console.error(err.stack || err)
          if (err.details) {
            console.error(err.details)
          }
          reject(err)
          return
        }

        console.log(stats.toString({
          chunks: false, // Makes the build much quieter
          chunkModules: false,
          colors: true, // Shows colors in the console
          children: false,
          builtAt: true,
          modules: false
        }))
        console.log(chalk.cyan('\nBUILD AT:'), chalk.bold.white(moment().format('YYYY-MM-DD HH:mm:ss')))

        if (type !== 'watch') {
          // 如果不是 watch 模式, 就强制报错
          if (stats.hasErrors()) {
            reject(new Error(stats.toJson().errors))
          } else {
            resolve()
          }
        }
      }

      if (type !== 'watch') {
        compiler.run(callback)
      } else {
        compiler.watch({
          ignored: /node_modules/,
          aggregateTimeout: 300
        }, callback)
      }
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = compile
