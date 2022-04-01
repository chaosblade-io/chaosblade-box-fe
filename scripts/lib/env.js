'use strict'

// const fs = require('fs')
const path = require('path')
const paths = require('./paths')

const NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) {
  throw new Error(
    'The NODE_ENV environment variable is required but was not specified.'
  )
}

// 处理 NODE_PATH
process.env.NODE_PATH = (process.env.NODE_PATH || '')
  .split(path.delimiter)
  .filter(folder => folder && !path.isAbsolute(folder))
  .map(folder => path.resolve(paths.appDocs, folder))
  .join(path.delimiter)

// 获取 NODE_ENV 和 REACT_APP_* 等环境变量, 用于通过 DefinePlugin 注入至应用中
const REACT_APP = /^REACT_APP_/i

function getClientEnvironment (publicUrl) {
  const raw = Object.keys(process.env)
    .filter(key => REACT_APP.test(key))
    .reduce((env, key) => {
      env[key] = process.env[key]
      return env
    }, {
      NODE_ENV: process.env.NODE_ENV || 'development',
      MICRO_ENV: process.env.MICRO_ENV || false,
      INNER_ENV: process.env.INNER_ENV || false,
      LOCAL_ENV: process.env.LOCAL_ENV || false
    })
  // Stringify all values so we can feed into Webpack DefinePlugin
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key])
      return env
    }, {})
  }

  return { raw, stringified }
}

// def平台云构建获取环境
function getEnv () {
  if (!process.env.BUILD_ARGV_STR) {
    // 本地构建
    return 'development'
  }

  // 处理env
  const buildArgv = require('yargs-parser')(process.env.BUILD_ARGV_STR)
  let env = buildArgv['def_publish_env']

  if (env && env !== 'prod') {
    // 开启线上构建
    env = 'stage'
  } else {
    // 未开启线上构建
    env = 'prod'
  }
  return env
}

module.exports = {
  getClientEnvironment,
  getEnv
}
