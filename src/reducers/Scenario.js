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

import {Map} from 'immutable';
import _ from 'lodash';
import createReducer from './createReducer';
import Types from "../actions/Types";

export const INITIAL_STATE = Map({
    loading: false,
    refreshing: false,
    page: 1, // 当前页码
    pageSize: 10,
    pages: 1, // 总页码数
    total: 0, // 总记录数
    scenarios: [], // 场景列表
    statistics: {
        total: 0,
        basics: 0,
        applications: 0,
        containers: 0,
    },
    categories: []
});

const getScenarioCategoriesResult = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state;
    }
    let result = []
    const parseFunc = category => {
        let categories = [];
        if (!_.isEmpty(category.children)) {
            const children = category.children.map(child => {
                return parseFunc(child);
            })
            categories.push(...children);
        }
        return categories.push({categoryId: category.categoryId, categoryName: category.categoryName});
    }
    const categories = action.data;
    result.push(...categories.map(item => parseFunc(item)));
    return state.merge({categories: result});
}

// state 初始化的值，action 是 reducer
const getScenarioStatistics = (state, action) => {
    return state.merge({statistics: action.statistics});
}

const handleScenariosFetchingResult = (state, action) => {
    const {scenarios, pageSize, page, pages, total} = action.pageableData
    if (!_.isEmpty(scenarios)) {
        let _scenarios = _.orderBy(scenarios, ['modifyTime'], ['desc'])
        return state.merge({scenarios: _scenarios, pageSize, page, pages, total, loading: false, refresh: false})
    } else {
        return state.merge({scenarios: [], pageSize, page, pages, total, loading: false, refresh: false})
    }
}

const updateScenarioResult = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state;
    }
    const {scenarioId} = action.data;
    let current = state.toJS();
    let newScenarios = current.scenarios.map(item => {
        if (item.scenarioId === scenarioId) {
            return action.data;
        }
        return item;
    });
    return state.merge({scenarios: newScenarios});
}

const ACTION_HANDLERS = {
    [Types.GET_SCENARIO_CATEGORIES_RESULT]: getScenarioCategoriesResult,
    [Types.GET_SCENARIOS_STATISTICS_RESULT]: getScenarioStatistics,
    [Types.GET_SCENARIOS_PAGEABLE_RESULT]: handleScenariosFetchingResult,
    [Types.BAN_SCENARIO_RESULT]: updateScenarioResult,
    [Types.UNBAN_SCENARIO_RESULT]: updateScenarioResult,
};

export default createReducer(INITIAL_STATE, ACTION_HANDLERS);
