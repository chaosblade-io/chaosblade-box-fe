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
import {Errors} from "../constants/Errors";
import Actions from "../actions/Actions";
import {getError} from "./response";
import SiderApi from "../services/SiderApi";

export default () => {

    function* watchChangeLocale() {
        while (true) {
            const {locale} = yield take(Types.CHANGE_LOCALE);
            yield fork(changeLocale, locale)
        }
    }

    function* changeLocale(locale) {
        const {response, timeout} = yield race({
            response: call(SiderApi.changeLocale, locale),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.changeLocaleResult({...data.data, ...locale}));
                } else {
                    error = getError(data)
                }
            } else {
                error = getError(response)
            }
        }
        if (error) {
            yield all([
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchQuerySystemInfo() {
        while (true) {
            yield take(Types.QUERY_SYSTEM_INFO);
            yield fork(querySystemInfo)
        }
    }

    function* querySystemInfo() {
        const {response, timeout} = yield race({
            response: call(SiderApi.querySystemInfo),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.querySystemInfoResult(data.data));
                } else {
                    error = getError(data)
                }
            } else {
                error = getError(response)
            }
        }
        if (error) {
            yield all([
                put(Actions.querySystemInfoResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    return {
        watchQuerySystemInfo,
        watchChangeLocale,
    }
}


