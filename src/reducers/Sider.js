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
    locale: 'zh',
    version: 'v0.3.0',
});

const querySystemInfo = (state, action) => {
    const {locale, version} = action.data;
    return state.merge({locale, version})
}

const changeLocale = (state, action) => {
    const {locale} = action.data;
    if (_.isEmpty(locale)) {
        return state;
    }
    return state.merge({locale});
}

const ACTION_HANDLERS = {
    [Types.QUERY_SYSTEM_INFO_RESULT]: querySystemInfo,
    [Types.CHANGE_LOCALE_RESULT]: changeLocale,
};

export default createReducer(INITIAL_STATE, ACTION_HANDLERS);

