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

import _ from "lodash";

export const handleMachinesFetchingResult = (state, action) => {
    const {machines, pageSize, page, pages, total, original} = action.pageableData;
    if (_.isEmpty(machines)) {
        return state.merge({loading: false});
    }
    let _machines = _.orderBy(machines, ['modifyTime'], ['desc'])
    let s = {machines: _machines, pageSize, page, total}
    switch (original) {
        case "host":
            return state.merge({loading: false, hosts: s})
        case 'application':
            return state.merge({loading: false, applications: s})
        case 'pod':
            return state.merge({loading: false, pods: s})
        case 'node':
            return state.merge({loading: false, nodes: s})
        default:
            return state.merge({loading: false, hosts: s})
    }
}