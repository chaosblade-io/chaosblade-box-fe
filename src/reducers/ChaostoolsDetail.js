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
import createReducer from "./createReducer";
import Types from "../actions/Types";
import _ from "lodash";

export const INITIAL_STATE = Map({
    tools: {
        loading: false,
        name: "",
        title: "",
        subTitle: "",
        description: "",
        webSite: "",
        logo: "",
        latest: "",
        copyright: "",
        readme: "",
    },

    versionInfo: {
        loading: true,
        version: "",
        releaseUrl: "",
        downloadUrl: {},
        changelog: "",
        scenarioFiles: [],
    },
    // file: scenarios
    scenariosLoading: false,
    scenarios: [],
    // {
    //     file: xxx,
    //     loading: false,
    //     scenarios: [], // 场景列表,
    //     scenarioList: [],
    //     importScenarioCount: 0,
    // },
});

const fetchChaostoolsOverview = (state, action) => {
    return state.merge({tools: {loading: true}});
}

const fetchChaostoolsOverviewResult = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state;
    }
    const {name, title, subTitle, description, webSite, logo, latest, copyright, readme} = action.data;
    return state.merge({
        tools: {
            loading: false,
            name,
            title,
            subTitle,
            description,
            webSite,
            logo,
            latest,
            copyright,
            readme
        }
    });
}

const importScenarios = (state, action) => {
    const {scenarioCount, file} = action.data;
    const current = state.toJS();
    if (!_.isEmpty(current.scenarios)) {
        const scenarios = current.scenarios.map(item => {
            if (item.file === file) {
                item.importScenarioCount = scenarioCount;
            }
            return item;
        })
        return state.merge({scenarios: scenarios})
    }
    return state;
}

const fetchChaostoolsVersionInfo = (state, action) => {
    return this.state.merge({versionInfo: {loading: true}});
}

const fetchChaostoolsVersionInfoResult = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state;
    }
    const {version, releaseUrl, downloadUrl, changelog, scenarioFiles} = action.data;
    return state.merge({
        versionInfo: {
            loading: false, version, releaseUrl, downloadUrl, changelog, scenarioFiles
        }
    });
}

const fetchChaostoolsScenarios = (state, action) => {
    return state.merge({scenariosLoading: true});
}

const fetchChaostoolsScenariosResult = (state, action) => {
    const {items, file} = action.data;
    if (_.isEmpty(items)) {
        return state;
    }
    const current = state.toJS();
    const {name} = current.tools;
    const {scenarioFiles} = current.versionInfo;
    if (!_.isEmpty(scenarioFiles) &&
        current.scenarios.length == scenarioFiles.length) {
        current.scenarios = [];
    }
    let scenarioList = [];
    let scenarios = [];
    items.map(item => {
        const actions = item.actions.map(action => {
            scenarioList.push({
                "name": name + "." + item.target + "." + action.action,
                "longDesc": action.longDesc,
            });
            return {...action, name: action.action};
        });
        item.actions = actions;
        scenarios.push(item);
    })
    current.scenarios.push({
        loading: false,
        file,
        scenarios,
        scenarioList,
    })
    return state.merge({scenarios: current.scenarios});
}

const ACTION_HANDLERS = {
    [Types.FETCH_CHAOSTOOLS_OVERVIEW]: fetchChaostoolsOverview,
    [Types.FETCH_CHAOSTOOLS_OVERVIEW_RESULT]: fetchChaostoolsOverviewResult,
    [Types.FETCH_CHAOSTOOLS_VERSION_INFO]: fetchChaostoolsVersionInfo,
    [Types.FETCH_CHAOSTOOLS_VERSION_INFO_RESULT]: fetchChaostoolsVersionInfoResult,
    [Types.FETCH_CHAOSTOOLS_SCENARIOS]: fetchChaostoolsScenarios,
    [Types.FETCH_CHAOSTOOLS_SCENARIOS_RESULT]: fetchChaostoolsScenariosResult,
    [Types.IMPORT_SCENARIOS_RESULT]: importScenarios,

};

export default createReducer(INITIAL_STATE, ACTION_HANDLERS);