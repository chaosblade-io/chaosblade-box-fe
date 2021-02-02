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

import {all, call, delay, fork, put, race, take} from "redux-saga/effects";
import Types from "../actions/Types";
import NetworkConstants from "../constants/NetworkConstants";
import Actions from "../actions/Actions";
import ProbeApi from "../services/ProbeApi";
import {Errors} from "../constants/Errors";
import {getError} from "./response";

export default () => {

    function* watchBanProbe() {
        while (true) {
            const {probeId} = yield take(Types.BAN_PROBE);
            yield fork(banProbe, probeId)
        }
    }

    function* banProbe(probeId) {
        const {response, timeout} = yield race({
            response: call(ProbeApi.banProbe, probeId),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.banProbeResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }

        if (error) {
            yield all([
                put(Actions.banProbeResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchUnbanProbe() {
        while (true) {
            const {probeId} = yield take(Types.UNBAN_PROBE);
            yield fork(unbanProbe, probeId)
        }
    }

    function* unbanProbe(probeId) {
        const {response, timeout} = yield race({
            response: call(ProbeApi.unbanProbe, probeId),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.unbanProbeResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }

        if (error) {
            yield all([
                put(Actions.unbanProbeResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchInstallProbeByAnsible() {
        while (true) {
            const {values} = yield take(Types.INSTALL_PROBE_BY_ANSIBLE);
            yield fork(installProbeByAnsible, values)
        }
    }

    function* installProbeByAnsible(values) {
        const {response, timeout} = yield race({
            response: call(ProbeApi.installProbeByAnsible, values),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.installProbeByAnsibleResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }

        if (error) {
            yield all([
                put(Actions.installProbeByAnsibleResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchQueryProbesInstallation() {
        while (true) {
            const {probeIds} = yield take(Types.QUERY_PROBES_INSTALLATION);
            yield fork(queryProbesInstallation, probeIds)
        }
    }

    function* queryProbesInstallation(probeIds) {
        const {response, timeout} = yield race({
            response: call(ProbeApi.queryProbesInstallation, probeIds),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.queryProbesInstallationResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }

        if (error) {
            yield all([
                put(Actions.queryProbesInstallationResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchUninstallProbe() {
        while (true) {
            const {probeId} = yield take(Types.UNINSTALL_PROBE);
            yield fork(uninstallProbe, probeId)
        }
    }

    function* uninstallProbe(probeId) {
        const {response, timeout} = yield race({
            response: call(ProbeApi.uninstallProbe, probeId),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.uninstallProbeResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }

        if (error) {
            yield all([
                put(Actions.uninstallProbeResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    return {
        watchBanProbe,
        watchUnbanProbe,
        watchUninstallProbe,
        watchInstallProbeByAnsible,
        watchQueryProbesInstallation,
    }
}