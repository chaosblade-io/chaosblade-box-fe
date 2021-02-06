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
import {handleMachinesFetchingResult} from "../pages/Machine/libs/pageable";
import createReducer from "./createReducer";
import _ from 'lodash'

export const INITIAL_STATE = Map({
    loading: false,
    hostStatistics: {
        totals: 0,
        onlines: 0,
    },
    // host
    hosts: {
        page: 1,
        pageSize: 10,
        total: 0,
        machines: [],
    },
    // application
    applicationStatistics: {
        apps: 0,
        groups: 0,
        machines: 0,
    },
    applications: {
        page: 1,
        pageSize: 10,
        total: 0,
        machines: [],
    },
    // cluster
    clusterStatistics: {
        nodes: 0,
        namespaces: 0,
        pods: 0,
    },
    pods: {
        page: 1,
        pageSize: 10,
        total: 0,
        machines: [],
    },
    nodes: {
        page: 1,
        pageSize: 10,
        total: 0,
        machines: [],
    }
});

const getHostTotalStatisticsResult = (state, action) => {
    if (_.isEmpty(action.statistics)) {
        return state;
    }
    return state.merge({hostStatistics: action.statistics})
}

const getApplicationStatistics = (state, action) => {
    if (_.isEmpty(action.statistics)) {
        return state;
    }
    return state.merge({applicationStatistics: action.statistics});
}

const getK8sResourceStatistics = (state, action) => {
    if (_.isEmpty(action.statistics)) {
        return state;
    }
    return state.merge({clusterStatistics: action.statistics});
}

const banAndUnbanMachine = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state.merge({loading: false});
    }
    const {original} = action.data
    let current = state.toJS();
    let updateFunc = machine => {
        if (machine.machineId === action.data.machineId) {
            return action.data;
        }
        return machine;
    };
    switch (original) {
        case "host":
            return state.merge({loading: false, hosts: {machines: current.hosts.machines.map(updateFunc)}})
        case 'application':
            return state.merge({
                loading: false,
                applications: {
                    machines: current.applications.machines.map(updateFunc)
                }
            })
        case 'pod':
            return state.merge({loading: false, pods: {machines: current.pods.machines.map(updateFunc)}})
        case 'node':
            return state.merge({loading: false, nodes: {machines: current.nodes.machines.map(updateFunc)}})
        default:
            return state.merge({loading: false, hosts: {machines: current.hosts.machines.map(updateFunc)}})
    }
}

const getMachinesForHostPageable = (state, action) => {
    return state.merge({loading: true})
}

const ACTION_HANDLERS = {
    [Types.GET_MACHINES_FOR_HOST_PAGEABLE]: getMachinesForHostPageable,
    [Types.GET_MACHINES_FOR_HOST_PAGEABLE_RESULT]: handleMachinesFetchingResult,
    [Types.GET_APPLICATION_TOTAL_STATISTICS_RESULT]: getApplicationStatistics,
    [Types.GET_MACHINES_FOR_APPLICATION_PAGEABLE_RESULT]: handleMachinesFetchingResult,
    [Types.GET_HOST_TOTAL_STATISTICS_RESULT]: getHostTotalStatisticsResult,

    [Types.GET_K8S_RESOURCE_STATISTICS_RESULT]: getK8sResourceStatistics,
    [Types.GET_MACHINES_FOR_POD_PAGEABLE_RESULT]: handleMachinesFetchingResult,
    [Types.GET_MACHINES_FOR_NODE_PAGEABLE_RESULT]: handleMachinesFetchingResult,
    [Types.BAN_MACHINE_RESULT]: banAndUnbanMachine,
    [Types.UNBAN_MACHINE_RESULT]: banAndUnbanMachine,
};

export default createReducer(INITIAL_STATE, ACTION_HANDLERS);