'use strict'

const fs = require('fs-extra')
const glob = require('glob')
const path = require('path')
const assert = require('assert')
const chalk = require('chalk')
const extend = require('extend')
const { execSync } = require('child_process')

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)

const pkg = fs.readJsonSync(resolveApp('package.json'))

function overwriteAppPaths (oriPaths, config) {
  const paths = Object.assign({}, oriPaths)
  for (let k in config) {
    console.log(chalk.cyan('INFO:'), `已覆盖目录规则 ${k} 为 ${config[k]}`)
    paths[k] = (k === 'appDir') ? config[k] : path.resolve(paths.appDir, config[k])
  }
  return paths
}

function getBuilderConfig (appDir) {
  const bcFile = path.join(appDir, '.builderconfig')

  let builderConfig = {}

  if (fs.existsSync(bcFile)) {
    builderConfig = fs.readJsonSync(bcFile)
  }

  const builder = getBuilder()
  return extend(true, builder, builderConfig)
}

function getAppEntry (appSrc, entryRules, commons, feature = {}) {
  console.log('=========entryRules============', entryRules)
  assert(Array.isArray(entryRules), '此应用的 entry 配置不正确')
  let entry = {}

  for (let rule of entryRules) {
    let matched = glob.sync(rule, {
      cwd: appSrc
    })
    for (let file of matched) {
      let key = file.replace(/\.(js|jsx|mjs|ts|tsx)$/, '')

      entry[key] = path.join(appSrc, file)
    }
  }

  // 如果有 commons, 就强制添加 common 入口
  if (commons) {
    if (entry.common) {
      throw new Error('应用的 entry 不允许为 common, 请更换 entry 名称')
    }
  }

  return entry
}

function replaceRule (loaders, id, newRule) {
  for (let i = 0; i < loaders.length; i++) {
    const rule = loaders[i]
    if (rule.id === id) {
      loaders[i] = newRule
    }
  }
}

function getRule (loaders, id) {
  for (let i = 0; i < loaders.length; i++) {
    const rule = loaders[i]
    if (rule.id === id) {
      return rule
    }
  }
}

// 解决 webpack config 中 resolve.alias 的问题
function resolveAlias (appDir, opts) {
  return Object.keys(opts).reduce((ret, key) => {
    let resolver = opts[key]

    // 将所有 `./` 开头的模块按相对路径处理
    if (/^\.\//.test(resolver)) {
      resolver = path.resolve(appDir, resolver)
    }

    return Object.assign(ret, {
      [key]: resolver
    })
  }, {})
}

// 移除package.json里的builder
function getBuilder () {
  const builder = {
    entry: [
      'index.ts'
    ],
    alias: {
      '@alicloud/console-components-page$': '@alicloud/console-components-page/es',
      '@alicloud/console-components-intl$': '@alicloud/console-components-intl/es',
      '@alicloud/console-components-truncate$': '@alicloud/console-components-truncate/es',
      '@alicloud/console-components-actions$': '@alicloud/console-components-actions/es',
      '@alicloud/console-components-console-menu$': '@alicloud/console-components-console-menu/es',
      '@alicloud/console-components-app-layout$': '@alicloud/console-components-app-layout/es',
      '@alicloud/console-components-slide-panel$': '@alicloud/console-components-slide-panel/es'
    }
  }
  const dirNames = fs.readdirSync(resolveApp('src/'))
    .filter(name => fs.statSync(resolveApp(`src/${name}`)).isDirectory())

  dirNames.forEach(name => {
    builder.alias[name] = `./src/${name}`
  })
  return pkg && pkg.builder ? {...pkg.builder, ...builder} : builder
}

// 从 package.json 里的 repository 字段提取 namespace
// 从而获取 publicPath 和 namespace 和 chunkLoadingGlobal
function getRuntimeNamespace (NODE_ENV) {
  const namespaceReg = (repositoryURL) => {
    if (/(^git@)|(^http:\/\/)/.test(repositoryURL)) {
      const ret = repositoryURL.match(/\.com\/([\w-/.]*)\.git/) || repositoryURL.match(/:([\w-/.]*)\.git/)
      if (ret && ret[1]) {
        return ret[1]
      }
    }
    return ''
  }

  const getNamespace = () => {
    const group = process.env.BUILD_GIT_GROUP
    const project = process.env.BUILD_GIT_PROJECT
    const defReadeURL = group && project && `${group}/${project}` // 先从def添加的 环境变量 中获取仓库名
    if (defReadeURL) return defReadeURL

    let repositoryURL = ''
    try {
      repositoryURL = execSync('git remote -v', { cwd: process.cwd() }).toString('utf8').replace(/[\t|\s]/g, '').split('(fetch)')[0].split('origin')[1]
    } catch (e) {
      repositoryURL = pkg.repository && pkg.repository.url
    }

    return namespaceReg(repositoryURL)
  }

  const getVersion = () => {
    // 分支处理
    let branch = 'master'
    try {
      branch = process.env.BUILD_GIT_BRANCH || execSync('git symbolic-ref --short -q HEAD', { cwd: process.cwd() }).toString('utf8').trim()
    } catch (e) {}
    // 处理version
    let version = branch.split(/\//)[1] || pkg.version
    console.log('VERSION: ', version, ' BUILD_GIT_BRANCH: ' + branch)

    return version
  }

  // ${group}/${project}
  const namespace = getNamespace()
  if (!namespace) {
    console.log(chalk.yellow('WARNING:'), '无法获取 git repository， 请在 package.json 中配置 repository 或者 git remote add [your repository]')
  }
  const publicBasePath = process.env.LOCAL_ENV ? '/' : (NODE_ENV === 'development' || NODE_ENV === 'stage' ? '//dev.g.alicdn.com/'
  : '//g.alicdn.com/')

  // 版本（production模式）通过构建运行时获取，如获取不到使用（develop模式）package.json内设置
  // aone、just、def 基于分支构建 daily/x.y.z  \prepub/x.y.z 格式，
  // 都可以根据环境变量 BUILD_GIT_BRANCH 获取分支信息，解析出构建后版本
  const version = getVersion()

  // 用window.__ASSETS_PUBLIC_PATH__/__webpack_public_path__ 全局变量不支持多runtime隔离，需要按应该构建动态生成，实现隔离支持。
  // g.alicdn.com/{group}/{project}/{version}/
  // 资源本地化开启时：LOCAL_ENV 为 true ==> /{group}/{project}/
  const publicPath = process.env.PUBLIC_PATH || `${publicBasePath}${namespace ? namespace + '/' : ''}${process.env.LOCAL_ENV ? '' : (version ? version + '/' : '')}`
  // 默认 webpackChunk 多个应用时会产生冲突，通过namespace 进行隔离支持
  const chunkLoadingGlobal = namespace ? `webpackChunk-${namespace}`.replace(/[-/](\w)/g, ($0, $1) => $1.toUpperCase()) : 'webpackChunk'

  return { publicPath, namespace, chunkLoadingGlobal }
}

module.exports = {
  overwriteAppPaths,
  getBuilderConfig,
  getAppEntry,
  replaceRule,
  getRule,
  resolveAlias,
  appDirectory,
  resolveApp,
  getBuilder,
  getRuntimeNamespace
}
