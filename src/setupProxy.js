/*
 * Copyright 1999-2021 Alibaba Group Holding Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const proxy = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(['/api/FetchPublicChaostools',
        '/api/FetchChaostoolsOverview',
        '/api/FetchChaostoolsVersionInfo',
        '/api/FetchChaostoolsScenarios'], proxy.createProxyMiddleware({
        pathRewrite: {
            '^/api/FetchPublicChaostools': '/platform/market/chaostools/configuration.yaml',
            '^/api/FetchChaostoolsOverview': '/platform/market/chaostools',
            '^/api/FetchChaostoolsVersionInfo': '/platform/market/chaostools',
            '^/api/FetchChaostoolsScenarios': '/platform/market/chaostools',
        },
        target: "https://chaosblade.oss-cn-hangzhou.aliyuncs.com/",
        changeOrigin: true,
    }));
    app.use('/api/', proxy.createProxyMiddleware({
        pathRewrite: {'^/api': '/'},
        target: "http://101.133.239.202:8080/",
        changeOrigin: true
    }));
};