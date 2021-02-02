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

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const handleRandom = (url, config) => {
    const {file} = config;

    const index = new Date().getTime() % _.size(file);
    return file[index];
};

const MOCK_FILE_SEQUENCE = {};

const handleSequence = (url, config) => {
    const {key, file} = config;

    const cacheKey = _.defaultTo(key, url);
    let index = MOCK_FILE_SEQUENCE[cacheKey];

    if (_.isNull(index) || _.isUndefined(index) || index >= (_.size(file) - 1)) {
        index = 0;
    } else {
        index++;
    }

    MOCK_FILE_SEQUENCE[cacheKey] = index;

    return file[index];
};

const HANDLERS = {
    random: handleRandom,
    sequence: handleSequence
};

const mockApi = api => {
    const stub = (url, data, config = {}) => {
        const {mock = {}} = config;
        const {file, delay: mockDelay, mode} = mock;

        const delayTime = mockDelay || 500;

        let mockFile = `${url}.json`;
        if (!_.isEmpty(file)) {
            if (_.isString(file)) {
                mockFile = file;
            }
            if (_.isArray(file) && !_.isEmpty(file)) {
                if (_.isEmpty(mode)) {
                    mockFile = file[0];
                } else {
                    mockFile = HANDLERS[mode](url, mock);
                }

                mockFile = `${url}/${mockFile}`;
            }
        }

        console.log(`[MOCK] url: ${url}, params: ${JSON.stringify(data)}. filename: ${mockFile}, delay: ${delayTime}`);

        return new Promise((resolve, error) => {
            delay(delayTime).then(() => {
                import(`./mock/${mockFile}`)
                    .then(resolve)
                    .catch(error);
            });
        });
    };

    return {
        ...api,
        get: stub,
        post: stub
    };
};

export {mockApi};
