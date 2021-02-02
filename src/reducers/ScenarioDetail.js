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
import createReducer from './createReducer';
import Types from "../actions/Types";
import _ from 'lodash';

export const INITIAL_STATE = Map({
    loading: false,
    scenarioId: '',
    name: '',
    code: '',
    description: '',
    status: -1,
    version: '',
    original: '',
    supportScopeTypes: ['host', 'kubernetes'],
    categoryIds: [],
    createTime: '',
    modifyTime: '',
    parameters: [],
    categories: [],
});

const getScenarioById = (state, action) => {
    return state.merge({loading: true})
}
const getScenarioByIdResult = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state.merge({loading: false});
    }
    const {
        scenarioId,
        name,
        code,
        description,
        status,
        version,
        original,
        supportScopeTypes,
        categories,
        createTime,
        modifyTime,
        parameters,
    } = action.data;
    return state.merge({
        loading: false,
        scenarioId,
        name,
        code,
        description,
        status,
        version,
        original,
        supportScopeTypes,
        categoryIds: categories,
        createTime,
        modifyTime,
        parameters,
    });
}
const getScenarioCategories = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state;
    }
    return state.merge({categories: action.data})
}

const updateScenario = (state, action) => {
    return state.merge({loading: true})
}

const updateScenarioResult = (state, action) => {
    return getScenarioByIdResult(state, action);
}

const ACTION_HANDLERS = {
    [Types.GET_SCENARIO_BY_ID]: getScenarioById,
    [Types.GET_SCENARIO_BY_ID_RESULT]: getScenarioByIdResult,
    [Types.GET_SCENARIO_CATEGORIES_RESULT]: getScenarioCategories,
    [Types.UPDATE_SCENARIO]: updateScenario,
    [Types.UPDATE_SCENARIO_RESULT]: updateScenarioResult,
};

export default createReducer(INITIAL_STATE, ACTION_HANDLERS);
