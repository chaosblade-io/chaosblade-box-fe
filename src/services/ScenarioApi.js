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

// 获取场景列表
const getScenariosPageable = query => api.post('GetScenariosPageable', query);
const getScenarioById = scenarioId => api.post('GetScenarioById', scenarioId);
const getScenarioStatistics = () => api.post('GetScenarioStatistics');

// 获取场景目录
const getScenarioCategories = () => api.post('GetScenarioCategories');

const updateScenario = scenario => api.post('UpdateScenario', scenario);
const importScenarios = (scenarios, file) => api.post('ImportScenarios', scenarios, file);
const upgradeScenarios = scenarios => api.post('UpgradeScenarios', scenarios);
const banScenario = scenarioId => api.post('BanScenario', scenarioId);
const unbanScenario = scenarioId => api.post('UnbanScenario', scenarioId);

export default {
    getScenarioById,
    getScenariosPageable,
    getScenarioStatistics,
    getScenarioCategories,
    updateScenario,
    importScenarios,
    upgradeScenarios,
    banScenario,
    unbanScenario,
};
