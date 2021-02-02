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
import HostApi from "../services/HostApi";
import {getError} from "./response";
import {Errors} from "../constants/Errors";

export default () => {

    function* watchMachinesForHostFetching() {
        while (true) {
            const {query: filter} = yield take(Types.GET_MACHINES_FOR_HOST_PAGEABLE);
            yield fork(getMachinesForHostPageable, filter)
        }
    }

    function* getMachinesForHostPageable(filter) {
        const {response, timeout} = yield race({
            response: call(HostApi.getMachinesForHostPageable, filter),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                const {pageSize, page, pages, total, original} = data.data;
                if (data.success) {
                    yield put(Actions.getMachinesForHostPageableResult({
                        pageSize,
                        page,
                        pages,
                        total,
                        machines: data.data.data,
                        original,
                    }));
                } else {
                    error = getError(data)
                }
            } else {
                error = getError(response)
            }
        }
        if (error) {
            yield all([
                put(Actions.getMachinesForHostPageableResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchBanMachine() {
        while (true) {
            const machineId = yield take(Types.BAN_MACHINE);
            yield fork(banMachine, machineId);
        }
    }

    function* banMachine(machineId) {
        const {response, timeout} = yield race({
            response: call(HostApi.banMachine, machineId),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.banMachineResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all(
                [
                    put(Actions.banMachineResult()),
                    put(Actions.handleError(error.code, error.message))
                ]
            );
        }
    }

    function* watchUnbanMachine() {
        while (true) {
            const machineId = yield take(Types.UNBAN_MACHINE);
            yield fork(unbanMachine, machineId);
        }
    }

    function* unbanMachine(machineId) {
        const {response, timeout} = yield race({
            response: call(HostApi.unbanMachine, machineId),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.unbanMachineResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.unbanMachineResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchAnsibleHostsFetching() {
        while (true) {
            yield take(Types.GET_ANSIBLE_HOSTS);
            yield fork(getAnsibleHosts);
        }
    }

    function* getAnsibleHosts() {
        const {response, timeout} = yield race({
            response: call(HostApi.getAnsibleHosts),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });
        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.getAnsibleHostsResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.getAnsibleHostsResult()),
                put(Actions.handleError(error.code, error.message))
            ]);

        }
    }

    function* watchAnsibleHostsRegisterFetching() {
        while (true) {
            const hosts = yield take(Types.GET_ANSIBLE_HOSTS_REGISTER);
            yield fork(getAnsibleHostsRegister, hosts);
        }
    }

    function* getAnsibleHostsRegister(hosts) {
        const {response, timeout} = yield race({
            response: call(HostApi.getAnsibleHostsRegister, hosts),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.getAnsibleHostsRegisterResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.getAnsibleHostsRegisterResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchGetProbesFetching() {
        while (true) {
            const {query} = yield take(Types.GET_PROBES_PAGEABLE);
            yield fork(getProbesPageable, query)
        }
    }

    function* getProbesPageable(query) {
        const {response, timeout} = yield race({
            response: call(HostApi.getProbesPageable, query),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                const {pageSize, page, pages, total, original} = data.data;
                if (data.success) {
                    yield put(Actions.getProbesPageableResult({
                        pageSize,
                        page,
                        pages,
                        total,
                        probes: data.data.data,
                        original,
                    }));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }

        if (error) {
            yield all([
                put(Actions.getProbesPageableResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    return {
        watchMachinesForHostFetching,
        watchAnsibleHostsFetching,
        watchAnsibleHostsRegisterFetching,
        watchGetProbesFetching,
        watchBanMachine,
        watchUnbanMachine,
    }
}
