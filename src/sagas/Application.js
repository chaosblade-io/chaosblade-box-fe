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

import {all, call, delay, fork, put, race, take} from 'redux-saga/effects';
import NetworkConstants from "../constants/NetworkConstants";
import ApplicationApi from "../services/ApplicationApi";
import Types from "../actions/Types";
import Actions from '../actions/Actions'
import {Errors} from "../constants/Errors";
import {getError} from "./response";

export default () => {

    function* watchApplicationTotalStatisticFetching() {
        while (true) {
            const {active} = yield take(Types.GET_APPLICATION_TOTAL_STATISTICS);
            yield fork(getApplicationTotalStatistics, active);
        }
    }

    function* getApplicationTotalStatistics(active) {
        const {response, timeout} = yield race({
            response: call(ApplicationApi.getApplicationTotalStatistics, active),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.getApplicationTotalStatisticsResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.getApplicationTotalStatisticsResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchMachinesForApplicationFetching() {
        while (true) {
            const {query: filter} = yield take(Types.GET_MACHINES_FOR_APPLICATION_PAGEABLE);
            yield fork(getMachinesForApplicationPageable, filter)
        }
    }

    function* getMachinesForApplicationPageable(filter) {
        const {response, timeout} = yield race({
            response: call(ApplicationApi.getMachinesForApplicationPageable, filter),
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
                    yield put(Actions.getMachinesForApplicationPageableResult({
                        pageSize,
                        page,
                        pages,
                        total,
                        machines: data.data.data,
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
                put(Actions.getMachinesForApplicationPageableResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    return {
        watchApplicationTotalStatisticFetching,
        watchMachinesForApplicationFetching
    }
}