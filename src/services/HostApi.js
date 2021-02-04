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

const getHostTotalStatistics = () => api.post('GetHostTotalStatistics');
const getMachinesForHostPageable = query => api.post('GetMachinesForHost', query);
const getAnsibleHosts = () => api.post('GetAnsibleHosts');
const getAnsibleHostsRegister = (hosts) => api.post('GetAnsibleHostsRegister', hosts);
const getProbesPageable = query => api.post('GetProbesPageable', query);
const banMachine = machineId => api.post('BanMachine', machineId);
const unbanMachine = machineId => api.post('UnbanMachine', machineId);

export default {
    getHostTotalStatistics,
    getMachinesForHostPageable,
    getAnsibleHosts,
    getAnsibleHostsRegister,
    getProbesPageable,
    banMachine,
    unbanMachine,
}