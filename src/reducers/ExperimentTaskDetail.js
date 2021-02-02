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
import {ExperimentConstants} from "../constants/ExperimentConstants";
import _ from 'lodash';

export const INITIAL_STATE = Map({
    taskName: "",
    startTime: "",
    endTime: "",
    status: 0,
    resultStatus: ExperimentConstants.TASK_RESULT_STATUS_NULL.code,
    executeLoading: false,
    execute: {},
    metrics: [],
    loggingLoading: false,
    logging: []
});


const queryTaskResult = (state, action) => {
    const {taskName, startTime, endTime, status, resultStatus} = action.data;
    if (_.isEmpty(taskName)) {
        return state;
    }
    const rs = resultStatus === null ? ExperimentConstants.TASK_RESULT_STATUS_NULL.code : resultStatus;
    return state.merge({taskName, startTime, endTime, status, resultStatus: rs});
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
    const datas = action.data;
    let metrics = [];
    if (!_.isEmpty(datas)) {
        datas.map(data => {
            if (!_.isEmpty(data) && !_.isEmpty(data.metrics)) {
                data.metrics.map(metric => {
                    metrics.push({
                        ip: data.ip,
                        value: Number(metric.value),
                        date: metric.date,
                    })
                });
            }
        })
    }
    return state.merge({metrics});
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
