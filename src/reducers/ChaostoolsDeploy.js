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
    loading: false,
    refreshing: false,
    hosts: {
        loading: false,
        refreshing: false,
        page: 1, // 当前页码
        pageSize: 10,
        pages: 1, // 总页码数
        total: 0, // 总记录数
        machines: [], // 机器列表
    },
});

const handleMachinesFetchingResult = (state, action) => {
    const {machines, pageSize, page, pages, total} = action.pageableData
    let s;
    if (!_.isEmpty(machines)) {
        let _machines = _.orderBy(machines, ['modifyTime'], ['desc'])
        s = {machines: _machines, pageSize, page, pages, total, loading: false, refresh: false}
    } else {
        s = {machines: [], pageSize, page, pages, total, loading: false, refresh: false}
    }
    return state.merge({hosts: s})
}

const ACTION_HANDLERS = {
    [Types.GET_MACHINES_FOR_HOST_PAGEABLE_RESULT]: handleMachinesFetchingResult,
};

export default createReducer(INITIAL_STATE, ACTION_HANDLERS);