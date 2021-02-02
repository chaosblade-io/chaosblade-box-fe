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

export const INITIAL_STATE = Map({
    categories: []
});

const getScenarioCategories = (state, action) => {
    return state.merge({categories: action.data})
}

const ACTION_HANDLERS = {
    [Types.GET_SCENARIO_CATEGORIES_RESULT]: getScenarioCategories,
};

export default createReducer(INITIAL_STATE, ACTION_HANDLERS);
