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
import _ from 'lodash';

export const INITIAL_STATE = Map({
    ansibleHostsLoading: false,
    ansibleHosts: [],
    ansibleInstallationsLoading: false,
    ansibleInstallations: [],
    probesInstallationsLoading: false,
    probesInstallations: [],
});

const getAnsibleHosts = (state, action) => {
    return state.merge({ansibleHostsLoading: true})
}

const getAnsibleHostsResult = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state.merge({ansibleHostsLoading: false});
    }
    return state.merge({ansibleHostsLoading: false, ansibleHosts: action.data});
}

const installProbes = (state, action) => {
    return state.merge({ansibleInstallationsLoading: true})
}

const installProbesResult = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state.merge({ansibleInstallationsLoading: false});
    }
    return state.merge({ansibleInstallationsLoading: false, ansibleInstallations: action.data});
}

const queryProbesInstallation = (state, action) => {
    return state.merge({probesInstallationsLoading: true});
}

const queryProbesInstallationResult = (state, action) => {
    if (_.isEmpty(action.data)) {
        return state.merge({probesInstallationsLoading: false});
    }
    return state.merge({probesInstallationsLoading: false, probesInstallations: action.data});
}

const clearAnsibleRegisterResult = (state, action) => {
    return state.merge({ansibleHosts: [], ansibleInstallations: [], probesInstallations: []})
}

const ACTION_HANDLERS = {
    [Types.GET_ANSIBLE_HOSTS]: getAnsibleHosts,
    [Types.GET_ANSIBLE_HOSTS_RESULT]: getAnsibleHostsResult,
    [Types.INSTALL_PROBE_BY_ANSIBLE]: installProbes,
    [Types.INSTALL_PROBE_BY_ANSIBLE_RESULT]: installProbesResult,
    [Types.QUERY_PROBES_INSTALLATION]: queryProbesInstallation,
    [Types.QUERY_PROBES_INSTALLATION_RESULT]: queryProbesInstallationResult,
    [Types.CLEAR_ANSIBLE_REGISTER_RESULT]: clearAnsibleRegisterResult,
};

export default createReducer(INITIAL_STATE, ACTION_HANDLERS);
