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

// 应用统计
const getApplicationTotalStatistics = active => api.get('GetApplicationTotalStatistics', {active});
// 应用，获取
const getMachinesForApplicationPageable = query => api.post('GetMachinesForApplicationPageable', {query})


// 获取应用&应用分组
const getApplicationsAndGroups = active => api.get('GetApplicationsAndGroups', {active});

// 获取机器列表
const getMachinesPageable = (query) => api.get('GetMachines');
// 禁用机器
const banMachine = cid => api.post('BanMachine');
// 启用机器
const unbanMachine = cid => api.post('UnbanMachine');

// Experiment-Application Selected
// 获取应用
const getApplications = () => api.get('GetApplications');
// 获取应用分组
const getApplicationGroups = app => api.get('GetApplicationGroups');
// 获取演练的机器
const getMachines = (app, group) => api.get('GetMachines');

export default {
    getApplicationTotalStatistics,
    getMachinesForApplicationPageable,
    getMachinesPageable,
    getApplications,
    getApplicationGroups,
    getMachines,
};
