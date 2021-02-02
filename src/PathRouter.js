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

import React, {lazy, Suspense} from "react";
import {Route, Switch} from "react-router-dom";
import Category from "./pages/Scenario/Category";
import Task from "./pages/Experiment/Task";


const Overview = lazy(() => import('./pages/Overview'));
const Machine = lazy(() => import('./pages/Machine'))
const MachineRegister = lazy(() => import('./pages/Machine/Probe/Register'))
const ProbeManager = lazy(() => import('./pages/Machine/Probe/Manager'))
const Scenario = lazy(() => import("./pages/Scenario/List"))
const ScenarioCategory = lazy(() => import("./pages/Scenario/Category"))
const ScenarioDetail = lazy(() => import("./pages/Scenario/Detail"))
const Experiment = lazy(() => import("./pages/Experiment"))
const ExperimentCreating = lazy(() => import("./pages/Experiment/Creating"))
const ExperimentDetail = lazy(() => import("./pages/Experiment/Detail"))
const ExperimentTask = lazy(() => import("./pages/Experiment/Task"))
const ChaostoolsMarket = lazy(() => import("./pages/Chaostools/Market"))
const ChaostoolsDetail = lazy(() => import("./pages/Chaostools/Detail"))
const ChaostoolsDeployed = lazy(() => import("./pages/Chaostools/Deployed"))

const PathRouter = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <Switch>
            <Route exact path="/" component={Machine}></Route>
            <Route path="/overview" component={Overview}></Route>
            <Route exact path="/machine" component={Machine}></Route>
            <Route exact path="/machine/list" component={Machine}></Route>
            <Route exact path="/machine/register" component={MachineRegister}></Route>
            <Route exact path="/machine/probe" component={ProbeManager}></Route>
            <Route exact path="/scenario" component={Scenario}></Route>
            <Route exact path="/scenario/list" component={Scenario}></Route>
            <Route exact path="/scenario/category" component={Category}></Route>
            <Route exact path="/scenario/detail" component={ScenarioDetail}></Route>
            <Route exact path="/experiment" component={Experiment}></Route>
            <Route exact path="/experiment/list" component={Experiment}></Route>
            <Route exact path="/experiment/creating" component={ExperimentCreating}></Route>
            <Route exact path="/experiment/detail" component={ExperimentDetail}></Route>
            <Route exact path="/experiment/task" component={Task}></Route>
            <Route exact path="/chaostools/deployed" component={ChaostoolsDeployed}></Route>
            <Route exact path="/chaostools/market" component={ChaostoolsMarket}></Route>
            <Route exact path="/chaostools/detail" component={ChaostoolsDetail}></Route>
        </Switch>
    </Suspense>
)

export default PathRouter;