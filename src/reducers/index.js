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

import {combineReducers} from "redux";
import machine from './Machine'
import scenario from './Scenario'
import scenarioDetail from './ScenarioDetail'
import category from './Category'
import experiment from './Experiment'
import experimentCreating from './ExperimentCreating'
import experimentDetail from './ExperimentDetail'
import taskDetail from './ExperimentTaskDetail'
import probe from './Probe'
import register from './Register'
import chaostoolsDeploy from './ChaostoolsDeploy'
import chaostoolsDetail from './ChaostoolsDetail'
import chaostools from './Chaostools'
import error from './Error'
import sider from './Sider'

export default combineReducers({
    machine,
    probe,
    register,
    scenario,
    scenarioDetail,
    category,
    experiment,
    experimentCreating,
    experimentDetail,
    taskDetail,
    chaostoolsDeploy,
    chaostoolsDetail,
    error,
    chaostools,
    sider,
})