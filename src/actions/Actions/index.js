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

import Types from "../Types";

const Actions = {
    // Application
    getApplicationTotalStatistics: active => ({type: Types.GET_APPLICATION_TOTAL_STATISTICS}),
    getApplicationTotalStatisticsResult: statistics => ({
        type: Types.GET_APPLICATION_TOTAL_STATISTICS_RESULT, statistics
    }),
    getMachinesForApplicationPageable: query => ({type: Types.GET_MACHINES_FOR_APPLICATION_PAGEABLE, query}),
    getMachinesForApplicationPageableResult: pageableData => ({
        type: Types.GET_MACHINES_FOR_APPLICATION_PAGEABLE_RESULT,
        pageableData
    }),
    getMachinesForHostPageable: query => ({type: Types.GET_MACHINES_FOR_HOST_PAGEABLE, query}),
    getMachinesForHostPageableResult: pageableData => ({
        type: Types.GET_MACHINES_FOR_HOST_PAGEABLE_RESULT,
        pageableData
    }),
    getK8sResourceStatistics: () => ({type: Types.GET_K8S_RESOURCE_STATISTICS}),
    getK8sResourceStatisticsResult: statistics => ({
        type: Types.GET_K8S_RESOURCE_STATISTICS_RESULT, statistics
    }),
    getMachinesForPodPageable: query => ({type: Types.GET_MACHINES_FOR_POD_PAGEABLE, query}),
    getMachinesForPodPageableResult: pageableData => ({
        type: Types.GET_MACHINES_FOR_POD_PAGEABLE_RESULT, pageableData
    }),
    getMachinesForNodePageable: query => ({type: Types.GET_MACHINES_FOR_NODE_PAGEABLE, query}),
    getMachinesForNodePageableResult: pageableData => ({
        type: Types.GET_MACHINES_FOR_NODE_PAGEABLE_RESULT, pageableData
    }),
    banMachine: machineId => ({type: Types.BAN_MACHINE, machineId}),
    banMachineResult: data => ({type: Types.BAN_MACHINE_RESULT, data}),
    unbanMachine: machineId => ({type: Types.UNBAN_MACHINE, machineId}),
    unbanMachineResult: data => ({type: Types.UNBAN_MACHINE_RESULT, data}),
    getHostTotalStatistics: () => ({type: Types.GET_HOST_TOTAL_STATISTICS}),
    getHostTotalStatisticsResult: statistics => ({type: Types.GET_HOST_TOTAL_STATISTICS_RESULT, statistics}),
    queryCollectStatus: () => ({type: Types.QUERY_COLLECT_STATUS}),
    queryCollectStatusResult: data => ({type: Types.QUERY_COLLECT_STATUS_RESULT, data}),


    // Scenario
    getScenarioById: scenarioId => ({type: Types.GET_SCENARIO_BY_ID, scenarioId}),
    getScenarioByIdResult: data => ({type: Types.GET_SCENARIO_BY_ID_RESULT, data}),
    getScenariosStatistics: () => ({type: Types.GET_SCENARIOS_STATISTICS}),
    getScenariosStatisticsResult: statistics => ({type: Types.GET_SCENARIOS_STATISTICS_RESULT, statistics}),
    getScenariosPageable: query => ({type: Types.GET_SCENARIOS_PAGEABLE, query}),
    getScenariosPageableResult: pageableData => ({
        type: Types.GET_SCENARIOS_PAGEABLE_RESULT, pageableData
    }),
    updateScenario: scenario => ({type: Types.UPDATE_SCENARIO, scenario}),
    updateScenarioResult: data => ({type: Types.UPDATE_SCENARIO_RESULT, data}),
    banScenario: scenarioId => ({type: Types.BAN_SCENARIO, scenarioId}),
    banScenarioResult: data => ({type: Types.BAN_SCENARIO_RESULT, data}),
    unbanScenario: scenarioId => ({type: Types.UNBAN_SCENARIO, scenarioId}),
    unbanScenarioResult: data => ({type: Types.UNBAN_SCENARIO_RESULT, data}),
    importScenarios: (scenarios, file) => ({type: Types.IMPORT_SCENARIOS, scenarios, file}),
    importScenariosResult: data => ({type: Types.IMPORT_SCENARIOS_RESULT, data}),
    getScenarioCategories: query => ({type: Types.GET_SCENARIO_CATEGORIES, query}),
    getScenarioCategoriesResult: data => ({type: Types.GET_SCENARIO_CATEGORIES_RESULT, data}),

    // Ansible
    getAnsibleHosts: () => ({type: Types.GET_ANSIBLE_HOSTS}),
    getAnsibleHostsResult: (data) => ({type: Types.GET_ANSIBLE_HOSTS_RESULT, data}),
    getAnsibleHostsRegister: hosts => ({type: Types.GET_ANSIBLE_HOSTS_REGISTER}, hosts),
    getAnsibleHostsRegisterResult: data => ({type: Types.GET_ANSIBLE_HOSTS_REGISTER_RESULT, data}),
    installProbeByAnsible: values => ({type: Types.INSTALL_PROBE_BY_ANSIBLE, values}),
    installProbeByAnsibleResult: data => ({type: Types.INSTALL_PROBE_BY_ANSIBLE_RESULT, data}),
    clearAnsibleRegisterResult: () => ({type: Types.CLEAR_ANSIBLE_REGISTER_RESULT}),

    // Probe
    getProbesPageable: query => ({type: Types.GET_PROBES_PAGEABLE, query}),
    getProbesPageableResult: pageableData => ({type: Types.GET_PROBES_PAGEABLE_RESULT, pageableData}),
    banProbe: probeId => ({type: Types.BAN_PROBE, probeId}),
    banProbeResult: data => ({type: Types.BAN_PROBE_RESULT, data}),
    unbanProbe: probeId => ({type: Types.UNBAN_PROBE, probeId}),
    unbanProbeResult: data => ({type: Types.UNBAN_PROBE_RESULT, data}),
    uninstallProbe: probeId => ({type: Types.UNINSTALL_PROBE, probeId}),
    uninstallProbeResult: data => ({type: Types.UNINSTALL_PROBE_RESULT, data}),
    queryProbesInstallation: probeIds => ({type: Types.QUERY_PROBES_INSTALLATION, probeIds}),
    queryProbesInstallationResult: data => ({type: Types.QUERY_PROBES_INSTALLATION_RESULT, data}),

    // Experiment
    getExperimentStatistics: () => ({type: Types.GET_EXPERIMENT_STATISTICS}),
    getExperimentStatisticsResult: statistics => ({type: Types.GET_EXPERIMENT_STATISTICS_RESULT, statistics}),
    getExperimentsPageable: query => ({type: Types.GET_EXPERIMENTS_PAGEABLE, query}),
    getExperimentsPageableResult: pageableData => ({type: Types.GET_EXPERIMENTS_PAGEABLE_RESULT, pageableData}),
    getKubernetesNamespaces: () => ({type: Types.GET_KUBERNETES_NAMESPACES}),
    getKubernetesNamespacesResult: () => ({type: Types.GET_KUBERNETES_NAMESPACES_RESULT}),
    createExperiment: experiment => ({type: Types.CREATE_EXPERIMENT, experiment}),
    createExperimentResult: data => ({type: Types.CREATE_EXPERIMENT_RESULT, data}),
    updateExperiment: experiment => ({type: Types.UPDATE_EXPERIMENT, experiment}),
    updateExperimentResult: data => ({type: Types.UPDATE_EXPERIMENT_RESULT, data}),
    startExperiment: experimentId => ({type: Types.START_EXPERIMENT, experimentId}),
    startExperimentResult: data => ({type: Types.START_EXPERIMENT_RESULT, data}),
    getExperimentById: experimentId => ({type: Types.GET_EXPERIMENT_BY_ID, experimentId}),
    getExperimentByIdResult: data => ({type: Types.GET_EXPERIMENT_BY_ID_RESULT, data}),
    getTaskByExperimentId: experimentId => ({type: Types.GET_TASKS_BY_EXPERIMENT_ID, experimentId}),
    getTaskByExperimentIdResult: data => ({type: Types.GET_TASKS_BY_EXPERIMENT_ID_RESULT, data}),
    queryTaskResult: taskId => ({type: Types.QUERY_TASK_RESULT, taskId}),
    queryTaskResultResult: data => ({type: Types.QUERY_TASK_RESULT_RESULT, data}),
    clearExperimentDetailResult: () => ({type: Types.CLEAR_EXPERIMENT_DETAIL_RESULT}),
    endExperiment: taskId => ({type: Types.END_EXPERIMENT, taskId}),
    endExperimentResult: data => ({type: Types.END_EXPERIMENT_RESULT, data}),
    retryExperiment: task => ({type: Types.FAIL_RETRY_EXPERIMENT, task}),
    retryExperimentResult: data => ({type: Types.FAIL_RETRY_EXPERIMENT_RESULT, data}),
    queryTaskLog: taskId => ({type: Types.QUERY_TASK_LOG, taskId}),
    queryTaskLogResult: data => ({type: Types.QUERY_TASK_LOG_RESULT, data}),
    creatingFromMachine: data => ({type: Types.CREATING_FROM_MACHINE_RESULT, data}),
    creatingFromScenario: data => ({type: Types.CREATING_FROM_SCENARIO_RESULT, data}),
    queryTaskMonitor: query => ({type: Types.QUERY_TASK_MONITOR, query}),
    queryTaskMonitorResult: data => ({type: Types.QUERY_TASK_MONITOR_RESULT, data}),
    queryMetricCategory: query => ({type: Types.QUERY_METRIC_CATEGORY, query}),
    queryMetricCategoryResult: data => ({type: Types.QUERY_METRIC_CATEGORY_RESULT, data}),
    onScenarioCategoryChanged: data => ({type: Types.ON_SCENARIO_CATEGORY_CHANGED, data}),
    onScenarioChanged: data => ({type: Types.ON_SCENARIO_CHANGED, data}),
    onExperimentNameChanged: data => ({type: Types.ON_EXPERIMENT_NAME_CHANGED, data}),
    onMetricChanged: data => ({type: Types.ON_METRIC_CHANGED, data}),
    onMachinesChanged: data => ({type: Types.ON_MACHINES_CHANGED, data}),
    onDimensionChanged: data => ({type: Types.ON_DIMENSION_CHANGED, data}),


    // Cluster
    getClusterInfo: () => ({type: Types.GET_CLUSTER_INFO}),
    getClusterInfoResult: () => ({type: Types.GET_CLUSTER_INFO_RESULT}),

    // Chaostools
    getChaostoolsDeployedStatistics: name => ({type: Types.GET_CHAOSTOOLS_DEPLOYED_STATISTICS, name}),
    getChaostoolsDeployedStatisticsResult: date => ({type: Types.GET_CHAOSTOOLS_DEPLOYED_STATISTICS_RESULT, date}),
    deployChaostoolsToHost: tools => ({type: Types.DEPLOY_CHAOSTOOLS_TO_HOST, tools}),
    deployChaostoolsToHostResult: data => ({type: Types.DEPLOY_CHAOSTOOLS_TO_HOST_RESULT, data}),
    undeployChaostoolsForHost: tools => ({type: Types.UNDEPLOY_CHAOSTOOLS_FOR_HOST, tools}),
    undeployChaostoolsForHostResult: data => ({type: Types.UNDEPLOY_CHAOSTOOLS_FOR_HOST_RESULT, data}),
    upgradeChaostoolsToHost: tools => ({type: Types.UPGRADE_CHAOSTOOLS_TO_HOST, tools}),
    upgradeChaostoolsToHostResult: data => ({type: Types.UPGRADE_CHAOSTOOLS_TO_HOST_RESULT, data}),
    fetchChaostoolsScenarios: (name, version, file) => ({type: Types.FETCH_CHAOSTOOLS_SCENARIOS, name, version, file}),
    fetchChaostoolsScenariosResult: data => ({type: Types.FETCH_CHAOSTOOLS_SCENARIOS_RESULT, data}),
    fetchPublicChaostools: callback => ({type: Types.FETCH_PUBLIC_CHAOSTOOLS, callback}),
    fetchPublicChaostoolsResult: data => ({type: Types.FETCH_PUBLIC_CHAOSTOOLS_RESULT, data}),
    fetchChaostoolsOverview: name => ({type: Types.FETCH_CHAOSTOOLS_OVERVIEW, name}),
    fetchChaostoolsOverviewResult: data => ({type: Types.FETCH_CHAOSTOOLS_OVERVIEW_RESULT, data}),
    fetchChaostoolsVersionInfo: (name, version) => ({type: Types.FETCH_CHAOSTOOLS_VERSION_INFO, name, version}),
    fetchChaostoolsVersionInfoResult: data => ({type: Types.FETCH_CHAOSTOOLS_VERSION_INFO_RESULT, data}),

    handleError: (code, message) => ({type: Types.HANDLE_ERROR, code, message}),
    clearError: () => ({type: Types.HANDLE_ERROR}),
    handleCriticalError: error => ({type: Types.HANDLE_CRITICAL_ERROR, error}),
    clearCriticalError: () => ({type: Types.CLEAR_CRITICAL_ERROR}),
    loading: text => ({type: Types.LOADING, text}),
    loaded: () => ({type: Types.LOADED}),
    clearExperimentCreatingResult: () => ({type: Types.CLEAR_EXPERIMENT_CREATING_RESULT}),

    changeLocale: locale => ({type: Types.CHANGE_LOCALE, locale}),
    changeLocaleResult: data => ({type: Types.CHANGE_LOCALE_RESULT, data}),
    querySystemInfo: () => ({type: Types.QUERY_SYSTEM_INFO}),
    querySystemInfoResult: (data) => ({type: Types.QUERY_SYSTEM_INFO_RESULT, data}),
};
export default Actions;