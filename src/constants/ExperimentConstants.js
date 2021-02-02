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

export const ExperimentConstants = {
    TASK_STATUS_READY: {
        code: 0,
        desc: '准备运行'
    },
    TASK_STATUS_RUNNING: {
        code: 1,
        desc: '运行中',
    },
    TASK_STATUS_STOPPED: {
        code: 2,
        desc: '暂停',
    },
    TASK_STATUS_STOPPING: {
        code: 3,
        desc: '停止当中',
    },
    TASK_STATUS_END: {
        code: 4,
        desc: '已经结束'
    },

    TASK_RESULT_STATUS_NULL: {
        code: -1,
        desc: '暂无结果'
    },
    TASK_RESULT_STATUS_SUCCESS: {
        code: 0,
        desc: '执行成功'
    },
    TASK_RESULT_STATUS_FAILED: {
        code: 1,
        desc: '执行失败'
    },

    TASK_WAIT: {
        code: -1,
        desc: '未执行'
    },
    TASK_SUCCESS: {
        code: 0,
        desc: '成功',
    },
    TASK_FAILED: {
        code: 1,
        desc: '失败',
    },
    TASK_RUNNING: {
        code: 2,
        desc: '运行中'
    },

    TASK_UNKNOWN: {
        code: 3,
        desc: 'unknown'
    },

    MACHINE_STATUS_WAIT: {
        code: 0,
        desc: '未执行',
    },
    MACHINE_STATUS_RUNNING: {
        code: 1,
        desc: '执行中',
    },
    MACHINE_STATUS_SUCCESS: {
        code: 2,
        desc: '执行成功',
    },
    MACHINE_STATUS_FAILED: {
        code: 3,
        desc: '执行失败',
    }

}