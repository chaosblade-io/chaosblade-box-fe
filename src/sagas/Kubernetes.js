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
import Actions from "../actions/Actions";
import KubernetesApi from "../services/KubernetesApi";
import NetworkConstants from "../constants/NetworkConstants";
import {Errors} from "../constants/Errors";
import {getError} from "./response";

export default () => {
    function* watchGetK8sResourceStatistics() {
        while (true) {
            yield take(Types.GET_K8S_RESOURCE_STATISTICS);
            yield fork(getK8sResourceStatistics)
        }
    }

    function* getK8sResourceStatistics() {
        const {response, timeout} = yield race({
            response: call(KubernetesApi.getK8sResourceStatistics),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.getK8sResourceStatisticsResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.getK8sResourceStatisticsResult()),
                put(Actions.handleError(response))
            ]);
        }
    }

    function* watchGetMachinesForPod() {
        while (true) {
            const query = yield take(Types.GET_MACHINES_FOR_POD_PAGEABLE);
            yield fork(getMachinesForPodPageable, query)
        }
    }

    function* getMachinesForPodPageable(query) {
        const {response, timeout} = yield race({
            response: call(KubernetesApi.getMachinesForPodPageable, query),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.getMachinesForPodPageableResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.getMachinesForPodPageableResult()),
                put(Actions.handleError(response))
            ]);
        }
    }

    function* watchGetMachinesForNode() {
        while (true) {
            const query = yield take(Types.GET_MACHINES_FOR_NODE_PAGEABLE);
            yield fork(getMachinesForNodePageable, query)
        }
    }

    function* getMachinesForNodePageable(query) {
        const {response, timeout} = yield race({
            response: call(KubernetesApi.getMachinesForNodePageable, query),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.getMachinesForNodePageableResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.getMachinesForNodePageableResult()),
                put(Actions.handleError(response))
            ]);
        }
    }

    return {
        watchGetK8sResourceStatistics,
        watchGetMachinesForPod,
        watchGetMachinesForNode,
    }
}