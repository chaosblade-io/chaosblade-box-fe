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

import application from './Application'
import scenario from './Scenario'
import host from './Host'
import kubernetes from './Kubernetes'
import experiment from './Experiment'
import probe from './Probe'
import chaostools from './Chaostools'
import {fork} from "redux-saga/effects";

export default function* root() {
    yield fork(application().watchApplicationTotalStatisticFetching);
    yield fork(application().watchMachinesForApplicationFetching);
    yield fork(host().watchGetHostTotalStatistics);
    yield fork(host().watchMachinesForHostFetching);
    yield fork(host().watchAnsibleHostsFetching);
    yield fork(host().watchAnsibleHostsRegisterFetching);
    yield fork(host().watchGetProbesFetching);
    yield fork(host().watchBanMachine);
    yield fork(host().watchUnbanMachine);
    yield fork(scenario().watchScenarioStatisticsFetching);
    yield fork(scenario().watchScenariosFetching);
    yield fork(scenario().watchScenarioCategoriesFetching);
    yield fork(scenario().watchGetScenarioById);
    yield fork(scenario().watchBanScenario);
    yield fork(scenario().watchUnbanScenario);
    yield fork(scenario().watchUpdateScenario);
    yield fork(kubernetes().watchGetK8sResourceStatistics);
    yield fork(kubernetes().watchGetMachinesForPod);
    yield fork(kubernetes().watchGetMachinesForNode);
    yield fork(kubernetes().watchQueryCollectStatus);
    yield fork(experiment().watchExperimentStatisticFetching);
    yield fork(experiment().watchExperimentsFetching);
    yield fork(experiment().watchCreateExperiment);
    yield fork(experiment().watchUpdateExperiment);
    yield fork(experiment().watchStartExperiment);
    yield fork(experiment().watchGetExperimentById);
    yield fork(experiment().watchGetTasksByExperimentId);
    yield fork(experiment().watchQueryTaskResult);
    yield fork(experiment().watchEndExperiment);
    yield fork(experiment().watchRetryExperiment);
    yield fork(experiment().watchQueryTaskLogging);
    yield fork(experiment().watchQueryTaskMonitor);
    yield fork(experiment().watchQueryMetricCategory);
    yield fork(probe().watchBanProbe);
    yield fork(probe().watchUnbanProbe);
    yield fork(probe().watchUninstallProbe);
    yield fork(probe().watchInstallProbeByAnsible);
    yield fork(probe().watchQueryProbesInstallation);
    yield fork(chaostools().watchFetchPublicChaostools);
    yield fork(chaostools().watchImportScenarios);
    yield fork(chaostools().watchDeployChaostoolsToHost);
    yield fork(chaostools().watchFetchChaostoolsOverview);
    yield fork(chaostools().watchFetchChaostoolsVersionInfo);
    yield fork(chaostools().watchFetchChaostoolsScenarios);
}