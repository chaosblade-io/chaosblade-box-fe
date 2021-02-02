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
import {Button, Result, Space, Spin} from "antd";
import Actions from "../../../actions/Actions";
import {SyncOutlined} from "@ant-design/icons";
import {ExperimentConstants} from "../../../constants/ExperimentConstants";
import Task from "./index";
import styles from './index.module.scss';
import {connect} from "react-redux";

class TaskExecuting extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillUnmount() {
        clearInterval(this.executeTime);
    }

    endExperiment = () => {
        const {endExperiment} = this.props;
        const taskId = Task.getTaskId();
        endExperiment(taskId);
    }

    retryExperiment = () => {
        const {retryExperiment, status, resultStatus} = this.props;
        const taskId = Task.getTaskId();
        retryExperiment({taskId, status, resultStatus});
    }

    prepareRender = () => {
        return (
            <Result
                className={styles.executeStatus}
                status="info"
                title={<>实验准备中&nbsp;<SyncOutlined spin/></>}
            />
        );
    }

    runningRender = () => {
        const {status, resultStatus, queryTaskResult} = this.props;
        const taskId = Task.getTaskId();
        if (resultStatus === ExperimentConstants.TASK_RESULT_STATUS_NULL.code) {
            if (this.executeTime === undefined) {
                this.executeTime = setInterval((taskId) => {
                    queryTaskResult(taskId)
                }, 3000, taskId)
            }
            return (
                <Result
                    className={styles.executeStatus}
                    status="info"
                    title={<>实验执行中&nbsp;<SyncOutlined spin/></>}
                />
            );
        }

        if (resultStatus === ExperimentConstants.TASK_RESULT_STATUS_SUCCESS.code) {
            return (
                <Result
                    className={styles.executeStatus}
                    status="success"
                    title="实验执行成功"
                    extra={
                        <Space>
                            {this.Operations.END}
                        </Space>
                    }
                />
            );
        }
        if (resultStatus === ExperimentConstants.TASK_RESULT_STATUS_FAILED.code) {
            return <Result
                className={styles.executeStatus}
                status="error"
                title='实验执行失败'
                extra={
                    <Space>
                        {this.Operations.RETRY}
                        {this.Operations.END}
                    </Space>
                }
            />
        }
        return <Result
            className={styles.executeStatus}
            status="warning"
            title={'未知状态： ' + status + "," + resultStatus}
        />
    }

    endRender = () => {
        const {status, resultStatus} = this.props;
        if (resultStatus === ExperimentConstants.TASK_RESULT_STATUS_SUCCESS.code) {
            return <Result
                className={styles.executeStatus}
                status="success"
                title='实验已结束'
            />
        }
        if (resultStatus === ExperimentConstants.TASK_RESULT_STATUS_FAILED.code) {
            return <Result
                className={styles.executeStatus}
                status="error"
                title='实验终止失败'
                extra={
                    <Space>
                        {this.Operations.RETRY}
                    </Space>
                }
            />
        }
        return <Result
            className={styles.executeStatus}
            status="warning"
            title={'未知状态： ' + status + "," + resultStatus}
        />
    }

    stoppingRender = () => {
        const {status, resultStatus} = this.props;
        if (resultStatus === ExperimentConstants.TASK_RESULT_STATUS_NULL.code) {
            return (
                <Result
                    className={styles.executeStatus}
                    status="info"
                    title={<>实验终止中&nbsp;<SyncOutlined spin/></>}
                />
            );
        }
        return <Result
            className={styles.executeStatus}
            status="warning"
            title={'未知状态： ' + status + "," + resultStatus}
        />
    }

    statusRender = () => {
        const {status, resultStatus} = this.props;
        if (status === ExperimentConstants.TASK_STATUS_READY.code) {
            return this.prepareRender();
        }
        if (status === ExperimentConstants.TASK_STATUS_RUNNING.code) {
            return this.runningRender();
        }
        if (status === ExperimentConstants.TASK_STATUS_STOPPING.code) {
            return this.stoppingRender();
        }
        if (status === ExperimentConstants.TASK_STATUS_END.code) {
            return this.endRender();
        }

        return (
            <Result
                className={styles.executeStatus}
                status="warning"
                title={'未知状态： ' + status + "," + resultStatus}
            />
        );
    }

    render() {
        const {executeLoading} = this.props
        return (<Spin spinning={executeLoading}>{this.statusRender()}</Spin>);
    }

    Operations = {
        RETRY: <Button onClick={this.retryExperiment.bind(this)} key="retry">重试</Button>,
        END: <Button onClick={this.endExperiment.bind(this)} key="end">终止</Button>
    }
}

const mapStateToProps = state => {
    const task = state.taskDetail.toJS();
    return {
        phase: task.phase,
        startTime: task.startTime,
        endTime: task.endTime,
        status: task.status,
        resultStatus: task.resultStatus,
        machines: [],
        executeLoading: task.executeLoading,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        queryTaskResult: taskId => dispatch(Actions.queryTaskResult(taskId)),
        retryExperiment: task => dispatch(Actions.retryExperiment(task)),
        endExperiment: taskId => dispatch(Actions.endExperiment(taskId)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TaskExecuting);