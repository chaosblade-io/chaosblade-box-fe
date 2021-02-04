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

import React from "react";
import {Card, Col, Row} from "antd";
import TaskLogging from "./TaskLogging";
import styles from './index.module.scss';
import TaskExecuting from "./TaskExecuting";
import TaskInfo from "./TaskInfo";
import TaskMonitoring from "./TaskMonitoring";
import queryString from "query-string";
import {ExperimentConstants, TASK_STATUS} from "../../../constants/ExperimentConstants";


class Task extends React.Component {

    static getTaskId() {
        const parsed = queryString.parse(window.location.search);
        const {id} = parsed;
        return id;
    }

    static getTaskStatus(status, resultStatus) {
        if (status == null || status === ExperimentConstants.TASK_STATUS_READY.code) {
            return ExperimentConstants.TASK_WAIT;
        }
        if (status === ExperimentConstants.TASK_STATUS_RUNNING.code) {
            if (resultStatus === ExperimentConstants.TASK_RESULT_STATUS_SUCCESS.code) {
                return ExperimentConstants.TASK_START_SUCCESS;
            }
            if (resultStatus === ExperimentConstants.TASK_RESULT_STATUS_FAILED.code) {
                return ExperimentConstants.TASK_START_FAILED;
            }
            return ExperimentConstants.TASK_START_RUNNING;

        }
        if (status === ExperimentConstants.TASK_STATUS_STOPPING.code) {
            return ExperimentConstants.TASK_END_RUNNING;
        }
        if (status === ExperimentConstants.TASK_STATUS_END.code) {
            if (resultStatus === ExperimentConstants.TASK_RESULT_STATUS_SUCCESS.code) {
                return ExperimentConstants.TASK_END_SUCCESS;
            }
            if (resultStatus === ExperimentConstants.TASK_RESULT_STATUS_FAILED.code) {
                return ExperimentConstants.TASK_END_FAILED;
            }
        }
        return ExperimentConstants.TASK_UNKNOWN;
    }

    static parseTaskStatus(taskStatus) {
        if (taskStatus === -1) {
            return ExperimentConstants.TASK_WAIT;
        }
        return TASK_STATUS[taskStatus]
    }


    machineStatusRender = () => {
        return (
            <div className={styles.hostContainer}>
            </div>
        );
    }

    render() {
        return (
            <div>
                <div>
                    <Row gutter={[6, 6]}>
                        <Col flex="30%">
                            <Card title="基础信息" bordered={true} className={styles.taskCard}>
                                <TaskInfo/>
                            </Card>
                        </Col>
                        <Col flex="70%">
                            <Card title="监控" bordered={true} className={styles.taskCard}>
                                <TaskMonitoring/>
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={[6, 6]}>
                        <Col flex="50%">
                            <Card title="执行结果" bordered={true} className={styles.taskCard}>
                                <TaskExecuting/>
                            </Card>
                        </Col>
                        <Col flex="50%">
                            <Card title="执行日志" bordered={true} className={styles.taskCard}>
                                <TaskLogging/>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

export default Task;