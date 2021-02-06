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
    loading: false,
    experimentName: "",
    taskCount: 0,
    dimension: "",
    createTime: "",
    lastTaskCreateTime: "",
    lastTaskStatus: null,
    lastTaskResult: null,
    machines: [],
    scenarios: [],
    metrics: [],
    tasks: [],
    taskId: "",
});

const getExperimentById = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state.merge({loading: false});
    }
    const {
        experimentName,
        taskCount,
        dimension,
        createTime,
        lastTaskCreateTime,
        lastTaskStatus,
        lastTaskResult,
        machines,
        scenarios,
        metrics
    } = action.data;

    return state.merge({
        loading: false,
        experimentName,
        taskCount,
        dimension,
        createTime,
        lastTaskCreateTime,
        lastTaskStatus,
        lastTaskResult,
        machines,
        scenarios,
        metrics
    });
}

const getTasksByExperimentId = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state.merge({loading: false});
    }
    return state.merge({loading: false, tasks: action.data});
}

const clearExperimentDetailResult = (state, action) => {
    return state.merge({
        loading: false,
        experimentName: "",
        taskCount: 0,
        dimension: "",
        createTime: "",
        lastTaskCreateTime: "",
        lastTaskStatus: null,
        lastTaskResult: null,
        machines: [],
        scenarios: [],
        metrics: [],
        tasks: [],
        taskId: "",
    })
}

const startExperiment = (state, action) => {
    const {taskId} = action.data;
    if (_.isEmpty(taskId)) {
        return state;
    }
    return state.merge({taskId});
}

const ACTION_HANDLERS = {
    [Types.GET_EXPERIMENT_BY_ID_RESULT]: getExperimentById,
    [Types.GET_TASKS_BY_EXPERIMENT_ID_RESULT]: getTasksByExperimentId,
    [Types.CLEAR_EXPERIMENT_DETAIL_RESULT]: clearExperimentDetailResult,
    [Types.START_EXPERIMENT_RESULT]: startExperiment,
};

export default createReducer(INITIAL_STATE, ACTION_HANDLERS);
