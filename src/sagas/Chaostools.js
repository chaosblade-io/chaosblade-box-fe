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

import {all, call, delay, fork, put, putResolve, race, take} from 'redux-saga/effects';
import NetworkConstants from "../constants/NetworkConstants";
import Types from "../actions/Types";
import Actions from '../actions/Actions'
import ChaostoolsApi from "../services/ChaostoolsApi";
import ScenarioApi from "../services/ScenarioApi";
import yaml from "js-yaml";
import {Errors} from "../constants/Errors";
import {getError} from "./response";

export default () => {

    function* watchFetchPublicChaostools() {
        while (true) {
            const {callback} = yield take(Types.FETCH_PUBLIC_CHAOSTOOLS);
            yield fork(fetchPublicChaostools, callback);
        }
    }

    function* fetchPublicChaostools(callback) {
        const {response, timeout} = yield race({
            response: call(ChaostoolsApi.fetchPublicChaostools),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });
        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                const data = yaml.load(response.data, {json: true});
                callback && callback(data);
                yield put(Actions.fetchPublicChaostoolsResult(data));
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.fetchPublicChaostoolsResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchFetchChaostoolsOverview() {
        while (true) {
            const {name: name} = yield take(Types.FETCH_CHAOSTOOLS_OVERVIEW);
            yield fork(fetchChaostoolsOverview, name);
        }
    }

    function* fetchChaostoolsOverview(name) {
        const {response, timeout} = yield race({
            response: call(ChaostoolsApi.fetchChaostoolsOverview, name),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                const data = yaml.load(response.data, {json: true});
                yield put(Actions.fetchChaostoolsOverviewResult(data));
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.fetchChaostoolsOverviewResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchFetchChaostoolsVersionInfo() {
        while (true) {
            const {name: name, version: version} = yield take(Types.FETCH_CHAOSTOOLS_VERSION_INFO);
            yield fork(fetchChaostoolsVersionInfo, name, version);
        }
    }

    function* fetchChaostoolsVersionInfo(name, version) {
        const {response, timeout} = yield race({
            response: call(ChaostoolsApi.fetchChaostoolsVersionInfo, name, version),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                const data = yaml.load(response.data, {json: true});
                yield put(Actions.fetchChaostoolsVersionInfoResult(data));
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.fetchChaostoolsVersionInfoResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchFetchChaostoolsScenarios() {
        while (true) {
            const {name: name, version: version, file: file} = yield take(Types.FETCH_CHAOSTOOLS_SCENARIOS);
            yield fork(fetchChaostoolsScenarios, name, version, file);
        }
    }

    function* fetchChaostoolsScenarios(name, version, file) {
        const {response, timeout} = yield race({
            response: call(ChaostoolsApi.fetchChaostoolsScenarios, name, version, file),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                const data = yaml.load(response.data, {json: true});
                yield putResolve(Actions.fetchChaostoolsScenariosResult({...data, file}));
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.fetchPublicChaostoolsResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchImportScenarios() {
        while (true) {
            const {scenarios, file} = yield take(Types.IMPORT_SCENARIOS);
            yield fork(importScenarios, scenarios, file)
        }
    }

    function* importScenarios(scenarios, file) {
        const {response, timeout} = yield race({
            response: call(ScenarioApi.importScenarios, scenarios),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.importScenariosResult({...data.data, file}));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.importScenariosResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchDeployChaostoolsToHost() {
        while (true) {
            const {tools} = yield take(Types.DEPLOY_CHAOSTOOLS_TO_HOST);
            yield fork(deployChaostoolsToHost, tools);
        }
    }

    function* deployChaostoolsToHost(tools) {
        const {response, timeout} = yield race({
            response: call(ChaostoolsApi.deployChaostoolsToHost, tools),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.deployChaostoolsToHostResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.deployChaostoolsToHostResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchUndeployChaostoolsToHost() {
        while (true) {
            const {tools} = yield take(Types.UNDEPLOY_CHAOSTOOLS_FOR_HOST);
            yield fork(undeployChaostoolsToHost, tools);
        }
    }

    function* undeployChaostoolsToHost(tools) {
        const {response, timeout} = yield race({
            response: call(ChaostoolsApi.undeployChaostoolsForHost, tools),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.undeployChaostoolsForHostResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.undeployChaostoolsForHostResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    return {
        watchFetchChaostoolsOverview,
        watchFetchChaostoolsVersionInfo,
        watchFetchChaostoolsScenarios,
        watchFetchPublicChaostools,
        watchImportScenarios,
        watchDeployChaostoolsToHost,
        watchUndeployChaostoolsToHost,
    }
}