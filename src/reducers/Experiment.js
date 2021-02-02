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
import _ from "lodash";

export const INITIAL_STATE = Map({
    statistics: {
        total: 0,
        running: 0,
        exception: 0,
        success: 0,
        failure: 0,
    },
    loading: false,
    refreshing: false,
    page: 1, // 当前页码
    pageSize: 10,
    pages: 1, // 总页码数
    total: 0, // 总记录数
    experiments: [], // 机器列表

});

const getExperimentStatistics = (state, action) => {
    if (_.isEmpty(action.statistics)) {
        return state;
    }
    return state.merge({statistics: action.statistics});
}

const handleExperimentsFetchingResult = (state, action) => {
    const {experiments, pageSize, page, pages, total} = action.pageableData
    if (!_.isEmpty(experiments)) {
        let _experiments = _.orderBy(experiments, ['modifyTime'], ['desc'])
        return state.merge({experiments: _experiments, pageSize, page, pages, total, loading: false, refresh: false})
    } else {
        return state.merge({experiments: [], pageSize, page, pages, total, loading: false, refresh: false})
    }
}

const ACTION_HANDLERS = {
    [Types.GET_EXPERIMENT_STATISTICS_RESULT]: getExperimentStatistics,
    [Types.GET_EXPERIMENTS_PAGEABLE_RESULT]: handleExperimentsFetchingResult,
};

export default createReducer(INITIAL_STATE, ACTION_HANDLERS);
