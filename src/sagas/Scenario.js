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
import Types from "../actions/Types";
import Actions from '../actions/Actions'
import ScenarioApi from "../services/ScenarioApi";
import {Errors} from "../constants/Errors";
import {getError} from "./response";
import {ScenarioConstants} from "../constants/ScenarioConstants";

export default () => {

    function* watchGetScenarioById() {
        while (true) {
            const {scenarioId} = yield take(Types.GET_SCENARIO_BY_ID);
            yield fork(getScenarioById, scenarioId);
        }
    }

    function* getScenarioById(scenarioId) {
        const {response, timeout} = yield race({
            response: call(ScenarioApi.getScenarioById, scenarioId),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.getScenarioByIdResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield  all([
                put(Actions.getScenarioByIdResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchScenarioStatisticsFetching() {
        while (true) {
            yield take(Types.GET_SCENARIOS_STATISTICS);
            yield fork(getScenarioStatistics);
        }
    }

    function* getScenarioStatistics() {
        const {response, timeout} = yield race({
            response: call(ScenarioApi.getScenarioStatistics),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.getScenariosStatisticsResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield  all([
                put(Actions.getScenariosStatisticsResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchScenariosFetching() {
        while (true) {
            const {query: filter} = yield take(Types.GET_SCENARIOS_PAGEABLE);
            yield fork(getScenariosPageable, filter)
        }
    }

    function* getScenariosPageable(filter) {
        const {response, timeout} = yield race({
            response: call(ScenarioApi.getScenariosPageable, filter),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                const {pageSize, page, pages, total} = data.data;
                if (data.success) {
                    yield put(Actions.getScenariosPageableResult({
                        pageSize,
                        page,
                        pages,
                        total,
                        scenarios: data.data.data,
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
                put(Actions.getScenariosPageableResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchScenarioCategoriesFetching() {
        while (true) {
            const {query} = yield take(Types.GET_SCENARIO_CATEGORIES);
            yield fork(getScenarioCategories, query)
        }
    }

    function* getScenarioCategories(query) {
        const {response, timeout} = yield race({
            response: call(ScenarioApi.getScenarioCategories, query),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });
        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.getScenarioCategoriesResult(data.data));
                    if (query !== undefined) {
                        const scenarioCategoryIdSelected = query.scenarioCategoryIdSelected;
                        const dimension = query.dimension;
                        if (scenarioCategoryIdSelected !== null || scenarioCategoryIdSelected !== undefined) {
                            let categoryId = scenarioCategoryIdSelected;
                            if (categoryId === '') {
                                const categories = data.data;
                                categoryId = categories[0].categoryId;
                                for (let i = 0; i < categories.length; i++) {
                                    if (categories[i].parentId !== '') {
                                        categoryId = categories[i].categoryId;
                                        break;
                                    }
                                }
                            }
                            yield put(Actions.getScenariosPageable(
                                {
                                    categoryId: categoryId,
                                    scopeType: dimension,
                                    status: ScenarioConstants.STATUS_PUBLISH.code,
                                    page: 1,
                                    pageSize: 10,
                                }
                            ))
                        }
                    }
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.getScenarioCategoriesResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchBanScenario() {
        while (true) {
            const {scenarioId} = yield take(Types.BAN_SCENARIO);
            yield fork(banScenario, scenarioId);
        }
    }

    function* banScenario(scenarioId) {
        const {response, timeout} = yield race({
            response: call(ScenarioApi.banScenario, scenarioId),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.banScenarioResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.banScenarioResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchUnbanScenario() {
        while (true) {
            const {scenarioId} = yield take(Types.UNBAN_SCENARIO);
            yield fork(unbanScenario, scenarioId);
        }
    }

    function* unbanScenario(scenarioId) {
        const {response, timeout} = yield race({
            response: call(ScenarioApi.unbanScenario, scenarioId),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.unbanScenarioResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.unbanScenarioResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchUpdateScenario() {
        while (true) {
            const {scenario: scenario} = yield take(Types.UPDATE_SCENARIO);
            yield fork(updateScenario, scenario);
        }
    }

    function* updateScenario(scenario) {
        const {response, timeout} = yield race({
            response: call(ScenarioApi.updateScenario, scenario),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.updateScenarioResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.updateScenarioResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    return {
        watchGetScenarioById,
        watchScenariosFetching,
        watchScenarioStatisticsFetching,
        watchScenarioCategoriesFetching,
        watchBanScenario,
        watchUnbanScenario,
        watchUpdateScenario,
    }
}