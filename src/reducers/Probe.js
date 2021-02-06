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
    page: 1,
    pageSize: 10,
    pages: 1,
    total: 0,
    probes: [],
})

const getProbePageableFetching = (state, action) => {
    return state.merge({loading: true});
}
const getProbePageableFetchingResult = (state, action) => {
    if (_.isEmpty(action.pageableData)) {
        return state.merge({loading: false});
        ;
    }
    const {probes, pageSize, page, pages, total, original} = action.pageableData;
    if (!_.isEmpty(probes)) {
        let _probes = _.orderBy(probes, ['modifyTime'], ['desc'])
        return state.merge({probes: _probes, pageSize, page, total, loading: false})
    }
    return state.merge({probes: [], pageSize, page, total, loading: false});
}

const updateProbe = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state.merge({loading: false});
        ;
    }
    const {probeId} = action.data;
    let current = state.toJS();
    let newProbes = current.probes.map(item => {
        if (item.probeId === probeId) {
            return action.data;
        }
        return item;
    });
    return state.merge({loading: false, probes: newProbes});
}

const ACTION_HANDLERS = {
    [Types.GET_PROBES_PAGEABLE]: getProbePageableFetching,
    [Types.GET_PROBES_PAGEABLE_RESULT]: getProbePageableFetchingResult,
    [Types.BAN_PROBE_RESULT]: updateProbe,
    [Types.UNBAN_PROBE_RESULT]: updateProbe,
    [Types.UNINSTALL_PROBE]: updateProbe,
};

export default createReducer(INITIAL_STATE, ACTION_HANDLERS);
