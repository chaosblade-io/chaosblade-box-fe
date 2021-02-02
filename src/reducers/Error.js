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

import {Map} from 'immutable';
import Types from '../actions/Types';
import createReducer from './createReducer';

export const INITIAL_STATE = Map({
    requestId: "",
    code: -1,
    message: null,
    criticalError: null
});

const handleError = (state, action) => state.merge({
    requestId: action.requestId,
    code: action.code,
    message: action.message
});

const handlerCriticalError = (state, action) => state.merge({criticalError: action.error});

const clearError = state => state.merge({requestId: "", code: -1, message: null});

const clearCriticalError = state => state.merge({criticalError: null});

const ACTION_HANDLERS = {
    [Types.HANDLE_ERROR]: handleError,
    [Types.CLEAR_ERROR]: clearError,
    [Types.HANDLE_CRITICAL_ERROR]: handlerCriticalError,
    [Types.CLEAR_CRITICAL_ERROR]: clearCriticalError
};

export default createReducer(INITIAL_STATE, ACTION_HANDLERS);