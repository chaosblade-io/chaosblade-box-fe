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

import {Map} from "immutable";
import Types from "../actions/Types";
import createReducer from "./createReducer";
import _ from 'lodash';

export const INITIAL_STATE = Map({
    experimentId: "",
    taskName: "",
    startTime: "",
    endTime: "",
    status: 0,
    resultStatus: null,
    executeLoading: false,
    execute: {},
    metrics: [],
    loggingLoading: false,
    logging: [],
    monitor: {
        name: "",
        params: [],
        metrics: [],
    }
});


const queryTaskResult = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state;
    }
    const {taskName, startTime, endTime, status, resultStatus, experimentId} = action.data;
    return state.merge({taskName, startTime, endTime, status, resultStatus, experimentId});
}

const failRetryExperiment = (state, action) => {
    return state.merge({executeLoading: true})
}
const failRetryExperimentResult = (state, action) => {
    return state.merge({executeLoading: false})
}

const endExperiment = (state, action) => {
    return state.merge({executeLoading: true})
}
const endExperimentResult = (state, action) => {
    return state.merge({executeLoading: false})
}

const queryTaskLog = (state, action) => {
    return state.merge({loggingLoading: true})
}
const queryTaskLogResult = (state, action) => {
    const logging = action.data ? action.data : [];
    return state.merge({logging, loggingLoading: false})
}

const queryTaskMonitorResult = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state;
    }
    const {name, code, params, metricTask} = action.data[0];
    let metrics = [];
    if (!_.isEmpty(metricTask)) {
        metricTask.map(data => {
            if (!_.isEmpty(data) && !_.isEmpty(data.metrics)) {
                data.metrics.map(metric => {
                    metrics.push({
                        name: data.metric,
                        value: Number(Number(metric.value).toFixed(2)),
                        date: metric.date,
                    })
                });
            }
        })
    }
    const _metrics = _.orderBy(metrics, ['date'], ['asc'])
    return state.merge({monitor: {metrics: _metrics, name, code, params}});
}

const ACTION_HANDLERS = {
    [Types.QUERY_TASK_RESULT_RESULT]: queryTaskResult,
    [Types.FAIL_RETRY_EXPERIMENT]: failRetryExperiment,
    [Types.FAIL_RETRY_EXPERIMENT_RESULT]: failRetryExperimentResult,
    [Types.QUERY_TASK_LOG]: queryTaskLog,
    [Types.QUERY_TASK_LOG_RESULT]: queryTaskLogResult,
    [Types.QUERY_TASK_MONITOR_RESULT]: queryTaskMonitorResult,
    [Types.END_EXPERIMENT]: endExperiment,
    [Types.END_EXPERIMENT_RESULT]: endExperimentResult,
};

export default createReducer(INITIAL_STATE, ACTION_HANDLERS);
