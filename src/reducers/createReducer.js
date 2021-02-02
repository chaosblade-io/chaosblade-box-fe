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

import _ from 'lodash';

const wrapHandlers = handlers => {
    let catchErrorHandler = {};
    for (let type in handlers) {
        if (handlers.hasOwnProperty(type)) {
            let handler = handlers[type];
            catchErrorHandler[type] = (state, action) => {
                try {
                    return handler(state, action);
                } catch (err) {
                    return state;
                }
            };
        }
    }
    return catchErrorHandler;
};

export default (initialState, handlers) => {
    if (_.isNil(initialState)) {
        throw new Error('initial state is required');
    }

    if (_.isNil(handlers) || !_.isObject(handlers)) {
        throw new Error('handlers must be an object');
    }
    const wrappedHandlers = wrapHandlers(handlers);
    return (state = initialState, action) => {
        if (_.isNil(action)) {
            return state;
        }
        if (!_.has(action, 'type')) {
            return state;
        }
        const handler = wrappedHandlers[action.type];
        if (_.isNil(handler)) {
            return state;
        }

        return handler(state, action);
    };
};