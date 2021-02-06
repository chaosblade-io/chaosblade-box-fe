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
import MachineConstants from "../constants/MachineConstants";

export const INITIAL_STATE = Map({
    loading: false,
    experimentName: "",
    collect: false,
    hosts: {
        page: 1, // 当前页码
        pageSize: 10,
        pages: 1, // 总页码数
        total: 0, // 总记录数
        machines: [], // 机器列表
    },
    categories: [],
    experimentId: "",
    dimension: "host",
    scenarios: {
        loading: false,
        page: 1,
        pageSize: 20,
        total: 0,
        scenarios: [],
    },
    scenarioSelected: null,
    machinesSelected: [],
    metricSelected: null,
    metricCategories: [],
    finished: false,
    scenarioCategoryIdSelected: '',
});

const handleMachinesFetching = (state, action) => {
    return state.merge({loading: true});
}

const handleMachinesFetchingResult = (state, action) => {
    if (_.isEmpty(action.pageableData)) {
        return state.merge({loading: false});
    }
    const {machines, pageSize, page, pages, total} = action.pageableData;
    let items = [];
    if (!_.isEmpty(machines)) {
        let _machines = _.orderBy(machines, ['status'], ['desc'])
        _machines.map(machine => {
            items.push({
                key: machine.machineId + "-" + machine.ip,
                title: machine.ip,
                ip: machine.ip,
                hostname: machine.hostname,
                description: machine.hostname + "-" + machine.ip,
                disabled: machine.status !== MachineConstants.MACHINE_STATUS_ONLINE.code,
            })
        })
    }
    return state.merge({loading: false, hosts: {machines: items, pageSize, page, pages, total, refresh: false}})
}

const getScenarioCategories = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state;
    }
    return state.merge({categories: action.data});
}

const createExperiment = (state, action) => {
    const {experimentId} = action.data;
    if (_.isEmpty(experimentId)) {
        return state;
    }
    return state.merge({experimentId, finished: true});
}

const updateExperiment = (state, action) => {
    const {experimentId} = action.data;
    if (_.isEmpty(experimentId)) {
        return state;
    }
    return state.merge({experimentId, finished: true});
}

const getScenariosPageable = (state, action) => {
    const {scenarios, pageSize, page, pages, total} = action.pageableData
    if (!_.isEmpty(scenarios)) {
        let _scenarios = _.orderBy(scenarios, ['modifyTime'], ['desc'])
        return state.merge({
            scenarios: {
                scenarios: _scenarios,
                pageSize,
                page,
                pages,
                total,
                loading: false,
                refresh: false
            }
        })
    } else {
        return state.merge({scenarios: {scenarios: [], pageSize, page, pages, total, loading: false, refresh: false}})
    }
}

const clearExperimentCreatingResult = (state, action) => {
    return state.merge({
        loading: false,
        refreshing: false,
        experimentName: "",
        hosts: {
            loading: false,
            refreshing: false,
            page: 1, // 当前页码
            pageSize: 2,
            pages: 1, // 总页码数
            total: 0, // 总记录数
            machines: [], // 机器列表
        },
        categories: [],
        experimentId: "",
        dimension: "host",
        scenarios: {
            loading: false,
            page: 1,
            pageSize: 20,
            pages: 0,
            total: 0,
            scenarios: [],
        },
        scenarioSelected: null,
        machinesSelected: [],
        metricSelected: null,
        finished: false,
        scenarioCategoryIdSelected: '',
        k8sCollect: false,
    })
}

const getExperimentById = (state, action) => {
    const {experimentId, experimentName, dimension, machines, scenarios, metrics} = action.data;
    let scenarioSelected = null;
    let categoryId = '';
    if (!_.isEmpty(scenarios)) {
        const scenario = scenarios[0];
        scenarioSelected = scenario;
        if (!_.isEmpty(scenario.categories)) {
            categoryId = scenario.categories[0].categoryId;

            scenarioSelected = {...scenarioSelected, categoryId}
        }
    }
    let metricSelected = null;
    if (!_.isEmpty(metrics)) {
        metricSelected = metrics[0];
    }
    let machinesSelected = [];
    if (!_.isEmpty(machines)) {
        machines.map(machine => machinesSelected.push(machine.machineId + "-" + machine.ip));
    }
    return state.merge({
        dimension: dimension ? dimension : "host",
        experimentId,
        experimentName,
        scenarioSelected,
        machinesSelected,
        metricSelected,
        scenarioCategoryIdSelected: categoryId
    });
}

const creatingFromMachine = (state, action) => {
    const {dimension, machineId, machineIp} = action.data;
    const machinesSelected = [machineId + "-" + machineIp];
    return state.merge({dimension, machinesSelected});
}

const creatingFromScenario = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state;
    }
    const {categoryId, scenarioId} = action.data;
    const scenario = {categoryId, scenarioId}
    return state.merge({scenarioSelected: scenario})
}

const queryMetricCategory = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state;
    }
    return state.merge({metricCategories: action.data});
}

const queryCollectStatus = (state, action) => {
    return state.merge({collect: action.data});
}

const onScenarioCategoryChanged = (state, action) => {
    const {categoryId} = action.data;
    return state.merge({scenarioCategoryIdSelected: categoryId});
}

const onScenarioChanged = (state, action) => {
    console.log("sc: ", action.data);
    if (_.isEmpty(action.data)) {
        return state.merge({scenarioSelected: null});
    }
    const {scenario} = action.data;
    return state.merge({scenarioSelected: scenario});
}

const onExperimentNameChanged = (state, action) => {
    const {name} = action.data;
    return state.merge({experimentName: name});
}

const onMetricChanged = (state, action) => {
    const {metric} = action.data;
    return state.merge({metricSelected: metric});
}

const onMachinesChanged = (state, action) => {
    console.log("c: ", action.data);
    const {machines} = action.data;
    return state.merge({machinesSelected: machines});
}

const onDimensionChanged = (state, action) => {
    const {dimension} = action.data;
    return state.merge({dimension});
}

const ACTION_HANDLERS = {
    [Types.GET_MACHINES_FOR_HOST_PAGEABLE]: handleMachinesFetching,
    [Types.GET_MACHINES_FOR_HOST_PAGEABLE_RESULT]: handleMachinesFetchingResult,
    [Types.GET_SCENARIO_CATEGORIES_RESULT]: getScenarioCategories,
    [Types.CREATE_EXPERIMENT_RESULT]: createExperiment,
    [Types.UPDATE_EXPERIMENT_RESULT]: updateExperiment,
    [Types.GET_SCENARIOS_PAGEABLE_RESULT]: getScenariosPageable,
    [Types.CLEAR_EXPERIMENT_CREATING_RESULT]: clearExperimentCreatingResult,
    [Types.GET_EXPERIMENT_BY_ID_RESULT]: getExperimentById,
    [Types.CREATING_FROM_MACHINE_RESULT]: creatingFromMachine,
    [Types.CREATING_FROM_SCENARIO_RESULT]: creatingFromScenario,
    [Types.QUERY_METRIC_CATEGORY_RESULT]: queryMetricCategory,
    [Types.QUERY_COLLECT_STATUS_RESULT]: queryCollectStatus,
    [Types.ON_SCENARIO_CATEGORY_CHANGED]: onScenarioCategoryChanged,
    [Types.ON_SCENARIO_CHANGED]: onScenarioChanged,
    [Types.ON_EXPERIMENT_NAME_CHANGED]: onExperimentNameChanged,
    [Types.ON_METRIC_CHANGED]: onMetricChanged,
    [Types.ON_MACHINES_CHANGED]: onMachinesChanged,
    [Types.ON_DIMENSION_CHANGED]: onDimensionChanged,
};

export default createReducer(INITIAL_STATE, ACTION_HANDLERS);
