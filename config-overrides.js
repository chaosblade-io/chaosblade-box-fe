const {override, fixBabelImports, addLessLoader, addWebpackAlias} = require('customize-cra');
const path = require("path");

module.exports = override(
    fixBabelImports(
        'import',
        {
            libraryName: 'antd',
            libraryDirectory: 'es',
            style: true
        }),
    addLessLoader({
        lessOptions: {
            javascriptEnabled: true,
            modifyVars: {'@primary-color': '#1DA57A'}
        }
    }),
    //增加路径别名的处理
    addWebpackAlias({
        '@': path.resolve('./src')
    })
);