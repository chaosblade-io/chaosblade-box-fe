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

const refresh = () => {
    console.log("convert-api-refresh");
};

const convertApi = api => {
    let {axiosInstance} = api;
    const {request} = axiosInstance;

    axiosInstance.request = (config = {}) => {
        const {data} = config;
        const baseURL = api.getBaseURL();
        const isAtkReq = baseURL.indexOf('/gungnir/') > -1;

        const params = {...data};

        return new Promise((resolve, reject) => {
            request({
                ...config,
                data: params
            })
                .then(response => {
                    const {status} = response;

                    if (status === 405 && !isAtkReq) {
                        refresh();
                    }

                    resolve(response);
                })
                .catch(err => {
                    if (err.message === 'Network Error' && !isAtkReq) {
                        refresh();
                    }
                    reject(err);
                });
        });
    };

    return api;
};

export {convertApi};
