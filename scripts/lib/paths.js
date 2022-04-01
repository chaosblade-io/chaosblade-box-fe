'use strict'

const { appDirectory, resolveApp } = require('./helper')

// config after eject: we're in ./config/
module.exports = {
  appDir: appDirectory,
  dotenv: resolveApp('.env'),
  appBuild: resolveApp('build'),
  appDocs: resolveApp('docs'),
  appSrc: resolveApp('src'),
  appIndexTs: resolveApp('src/index.ts'),
  appPackageJson: resolveApp('package.json'),
  appNodeModules: resolveApp('node_modules'),
  appTsConfig: resolveApp('tsconfig.json'),
  testSetup: resolveApp('test/setup.js')
}
