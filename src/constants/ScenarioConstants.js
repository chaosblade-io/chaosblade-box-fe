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

export const ScenarioConstants = {

    STATUS_READY: {code: 0, desc: '待发布'},
    STATUS_PUBLISH: {code: 1, desc: '已发布'},

    STATUS: {
        0: {code: 0, desc: '待发布'},
        1: {code: 1, desc: '已发布'},
    },

    SUPPORT_HOST_SCOPE: {
        code: 0, desc: 'host',
    },
    SUPPORT_KUBERNETES_SCOPE: {
        code: 0, desc: 'kubernetes',
    }
}