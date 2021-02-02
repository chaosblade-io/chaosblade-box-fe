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
import ExperimentApi from '../services/ExperimentApi'
import {Errors} from "../constants/Errors";
import {getError} from "./response";

export default () => {
    function* watchExperimentStatisticFetching() {
        while (true) {
            yield take(Types.GET_EXPERIMENT_STATISTICS);
            yield fork(getExperimentStatistics);
        }
    }

    function* getExperimentStatistics() {
        const {response, timeout} = yield race({
            response: call(ExperimentApi.getExperimentStatistics),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.getExperimentStatisticsResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield call([
                put(Actions.getExperimentStatisticsResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchExperimentsFetching() {
        while (true) {
            const {query: filter} = yield take(Types.GET_EXPERIMENTS_PAGEABLE);
            yield fork(getExperimentsPageable, filter)
        }
    }

    function* getExperimentsPageable(filter) {
        const {response, timeout} = yield race({
            response: call(ExperimentApi.getExperimentsPageable, filter),
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
                    yield put(Actions.getExperimentsPageableResult({
                        pageSize,
                        page,
                        pages,
                        total,
                        experiments: data.data.data,
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
                put(Actions.getExperimentsPageableResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchCreateExperiment() {
        while (true) {
            const {experiment: experiment} = yield take(Types.CREATE_EXPERIMENT);
            yield fork(createExperiment, experiment);
        }
    }

    function* createExperiment(experiment) {
        const {response, timeout} = yield race({
            response: call(ExperimentApi.createExperiment, experiment),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.createExperimentResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.createExperimentResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchUpdateExperiment() {
        while (true) {
            const {experiment: experiment} = yield take(Types.UPDATE_EXPERIMENT);
            yield fork(updateExperiment, experiment);
        }
    }

    function* updateExperiment(experiment) {
        const {response, timeout} = yield race({
            response: call(ExperimentApi.updateExperiment, experiment),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.updateExperimentResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.updateExperimentResult()),
                put(Actions.handleError(error.code, error.message))
            ]);
        }
    }

    function* watchGetExperimentById() {
        while (true) {
            const experimentId = yield take(Types.GET_EXPERIMENT_BY_ID);
            yield fork(getExperimentById, experimentId);
        }
    }

    function* getExperimentById(experimentId) {
        const {response, timeout} = yield race({
            response: call(ExperimentApi.getExperimentById, experimentId),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.getExperimentByIdResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.getExperimentByIdResult()),
                put(Actions.handleError(response))
            ]);
        }
    }

    function* watchGetTasksByExperimentId() {
        while (true) {
            const experimentId = yield take(Types.GET_TASKS_BY_EXPERIMENT_ID);
            yield fork(getTasksByExperimentId, experimentId);
        }
    }

    function* getTasksByExperimentId(experimentId) {
        const {response, timeout} = yield race({
            response: call(ExperimentApi.getTasksByExperimentId, experimentId),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.getTaskByExperimentIdResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.getTaskByExperimentIdResult()),
                put(Actions.handleError(response))
            ]);
        }
    }

    function* watchQueryTaskResult() {
        while (true) {
            const taskId = yield take(Types.QUERY_TASK_RESULT);
            yield fork(queryTaskResult, taskId);
        }
    }

    function* queryTaskResult(taskId) {
        const {response, timeout} = yield race({
            response: call(ExperimentApi.queryTaskResult, taskId),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.queryTaskResultResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.queryTaskResultResult()),
                put(Actions.handleError(response))
            ]);
        }
    }

    function* watchStartExperiment() {
        while (true) {
            const experimentId = yield take(Types.START_EXPERIMENT);
            yield fork(startExperiment, experimentId);
        }
    }

    function* startExperiment(experimentId) {
        const {response, timeout} = yield race({
            response: call(ExperimentApi.startExperiment, experimentId),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.startExperimentResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.startExperimentResult()),
                put(Actions.handleError(response))
            ]);
        }
    }

    function* watchEndExperiment() {
        while (true) {
            const taskId = yield take(Types.END_EXPERIMENT);
            yield fork(endExperiment, taskId);
        }
    }

    function* endExperiment(taskId) {
        const {response, timeout} = yield race({
            response: call(ExperimentApi.endExperiment, taskId),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.endExperimentResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.endExperimentResult()),
                put(Actions.handleError(response))
            ]);
        }
    }

    function* watchRetryExperiment() {
        while (true) {
            const task = yield take(Types.FAIL_RETRY_EXPERIMENT);
            yield fork(retryExperiment, task);
        }
    }

    function* retryExperiment(task) {
        const {response, timeout} = yield race({
            response: call(ExperimentApi.failRetryExperiment, task),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.retryExperimentResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.retryExperimentResult()),
                put(Actions.handleError(response))
            ]);
        }
    }

    function* watchQueryTaskLogging() {
        while (true) {
            const taskId = yield take(Types.QUERY_TASK_LOG);
            yield fork(queryTaskLogging, taskId);
        }
    }

    function* queryTaskLogging(taskId) {
        const {response, timeout} = yield race({
            response: call(ExperimentApi.queryTaskLogging, taskId),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.queryTaskLogResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.queryTaskLogResult()),
                put(Actions.handleError(response))
            ]);
        }
    }

    function* watchQueryTaskMonitor() {
        while (true) {
            const {query: query} = yield take(Types.QUERY_TASK_MONITOR);
            yield fork(queryTaskMonitor, query);
        }
    }

    function* queryTaskMonitor(query) {
        const {response, timeout} = yield race({
            response: call(ExperimentApi.queryTaskMonitor, query),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.queryTaskMonitorResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.queryTaskMonitorResult()),
                put(Actions.handleError(response))
            ]);
        }
    }

    function* watchQueryMetricCategory() {
        while (true) {
            const {query: query} = yield take(Types.QUERY_METRIC_CATEGORY);
            yield fork(queryMetricCategory, query);
        }
    }

    function* queryMetricCategory(query) {
        const {response, timeout} = yield race({
            response: call(ExperimentApi.queryMetricCategory, query),
            timeout: delay(NetworkConstants.TIMEOUT_INTERVAL)
        });

        let error;
        if (timeout) {
            error = Errors.TIMEOUT_ERROR;
        } else {
            if (response && response.ok) {
                let data = response.data;
                if (data.success) {
                    yield put(Actions.queryMetricCategoryResult(data.data));
                } else {
                    error = getError(data);
                }
            } else {
                error = getError(response);
            }
        }
        if (error) {
            yield all([
                put(Actions.queryMetricCategoryResult()),
                put(Actions.handleError(response))
            ]);
        }
    }

    return {
        watchExperimentStatisticFetching,
        watchExperimentsFetching,
        watchCreateExperiment,
        watchUpdateExperiment,
        watchStartExperiment,
        watchGetExperimentById,
        watchGetTasksByExperimentId,
        watchQueryTaskResult,
        watchEndExperiment,
        watchRetryExperiment,
        watchQueryTaskLogging,
        watchQueryTaskMonitor,
        watchQueryMetricCategory
    }
}

