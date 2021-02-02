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

import apisauce from 'apisauce';
import _ from 'lodash';
import queryString from 'query-string';
import ApiConfig from './api.config';
import {convertApi} from './convertApi';

const apiCache = {};

const createApi = (key = 'default', config = {}) => {
    if (apiCache[key]) {
        return apiCache[key];
    }

    const api = apisauce.create({
        ...ApiConfig,
        ...config
    });

    api.addRequestTransform(request => {
        console.log("request: ", request);
        const parsedSearchParams = queryString.parse(window.location.search, {parseNumbers: true});
        let params = request.params;

        const test = parsedSearchParams['test'];
        if (test === 1 || test === 2) {
            if (_.isEmpty(params)) {
                request.params = {test};
            } else {
                request.params = {...params, test};
            }
        }
    });

    api.addResponseTransform(response => {
        if (!_.isEmpty(response)) {
            const {ok, data: responseData} = response;
            if (ok && !_.isEmpty(responseData)) {
                const {success, code, message} = responseData;
                if (!success && !_.isEmpty(code)) {
                    response.ok = false;
                    response.problem = code;
                    response.message = message;
                }
            }
        }
    });

    console.log(process.env.NODE_ENV)
    if (process.env.NODE_ENV === 'development') {
        const {mock} = queryString.parse(window.location.search);
        // if (mock) {
            const {mockApi} = require('./mockApi');
            return mockApi(api);
        // }
    }

    const wrapper = convertApi(api);
    apiCache[key] = wrapper;
    return wrapper;
};

export default createApi;
