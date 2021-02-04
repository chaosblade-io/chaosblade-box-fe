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

// 获取实验统计
const getExperimentStatistics = () => api.post('GetExperimentTotalStatistics');

// 获取实验列表
const getExperimentsPageable = query => api.post('GetExperimentsPageable', query);

// 获取实验详情
const getExperimentById = experimentId => api.post('GetExperimentById', experimentId);

// 删除实验
const deleteExperiment = id => api.post('DeleteExperiment', id);

// 创建实验
const createExperiment = experiment => api.post('CreateExperiment', experiment);

// 更新实验
const updateExperiment = experiment => api.post('UpdateExperiment', experiment);

// 执行实验
const startExperiment = experimentId => api.post('StartExperiment', experimentId);

// 停止实验任务
const endExperiment = taskId => api.post('EndExperiment', taskId);

const getTasksByExperimentId = experimentId => api.post('GetTasksByExperimentId', experimentId)

const queryTaskResult = taskId => api.post('QueryTaskResult', taskId);
const failRetryExperiment = task => api.post('FailRetryExperiment', task);
const queryTaskLogging = taskId => api.post('QueryTaskLog', taskId);
const queryTaskMonitor = query => api.post('QueryTaskMonitor', query);
const queryMetricCategory = query => api.post('QueryMetricCategory', query);

export default {
    getExperimentById,
    createExperiment,
    updateExperiment,
    getExperimentStatistics,
    getExperimentsPageable,
    startExperiment,
    endExperiment,
    getTasksByExperimentId,
    queryTaskResult,
    failRetryExperiment,
    queryTaskLogging,
    queryTaskMonitor,
    queryMetricCategory
}