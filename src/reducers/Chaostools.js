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
    refreshing: false,
    chaostools: [],
    publics: [],
});

const fetchPublicChaostools = (state, action) => {
    return state.merge({loading: true});
}

const fetchPublicChaostoolsResult = (state, action) => {
    const {publics} = action.data;
    if (_.isEmpty(publics)) {
        return state;
    }
    return state.merge({loading: false, publics});
}

const fetchChaostoolsOverviewResult = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state;
    }
    const {name, title, subTitle, description, webSite, logo, latest, copyright, readme} = action.data;
    const current = state.toJS();
    const {chaostools, publics} = current;
    let tools = chaostools
    if (!_.isEmpty(publics) && publics.length === chaostools.length) {
        tools = [];
    }
    tools.push({
        name, title, subTitle, description, webSite, logo, latest, copyright, readme
    })
    return state.merge({chaostools: tools});
}

const ACTION_HANDLERS = {
    [Types.FETCH_PUBLIC_CHAOSTOOLS]: fetchPublicChaostools,
    [Types.FETCH_PUBLIC_CHAOSTOOLS_RESULT]: fetchPublicChaostoolsResult,
    [Types.FETCH_CHAOSTOOLS_OVERVIEW_RESULT]: fetchChaostoolsOverviewResult,
};

export default createReducer(INITIAL_STATE, ACTION_HANDLERS);