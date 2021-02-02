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

import createApi from './createApi';

const api = createApi();

const getChaostoolsDeployedStatistics = name => api.post('GetChaostoolsDeployedStatistics', name);
const deployChaostoolsToHost = tools => api.post('DeployChaostoolsToHost', tools);
const undeployChaostoolsForHost = tools => api.post('UndeployChaostoolsForHost', tools);
const upgradeChaostoolsToHost = tools => api.post('UpgradeChaostoolsToHost', tools);

const fetchScenarios = query => api.post('FetchScenarios', query);
const fetchPublicChaostools = () => api.get('FetchPublicChaostools');
const fetchChaostoolsOverview = (name) => api.get('FetchChaostoolsOverview/' + name + "/overview.yaml");
const fetchChaostoolsVersionInfo = (name, version) => api.get('FetchChaostoolsVersionInfo/' + name + '/' + version + '/version.yaml');
const fetchChaostoolsScenarios = (name, version, file) => api.get('FetchChaostoolsScenarios/' + name + '/' + version + '/' + file);

export default {
    deployChaostoolsToHost,
    undeployChaostoolsForHost,
    getChaostoolsDeployedStatistics,
    upgradeChaostoolsToHost,
    fetchScenarios,
    fetchPublicChaostools,
    fetchChaostoolsOverview,
    fetchChaostoolsVersionInfo,
    fetchChaostoolsScenarios
}