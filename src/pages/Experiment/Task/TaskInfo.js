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
import {Badge, Descriptions, Tag} from "antd";
import Actions from "../../../actions/Actions";
import {connect} from "react-redux";
import _ from 'lodash'
import Task from "./index";
import {ExperimentConstants} from "../../../constants/ExperimentConstants";
import * as moment from "moment";

class TaskInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            duration: {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            },
        }
    }

    componentDidMount() {
        const {queryTaskResult} = this.props;
        const taskId = Task.getTaskId();
        queryTaskResult(taskId);
        this.infoTime = setInterval(() => {
            let duration = this.getDuration();
            this.setState({duration})
        }, 1000)
    }

    getDuration() {
        const {startTime, endTime} = this.props;
        if (_.isEmpty(startTime)) {
            return this.state.duration;
        }
        const start = moment(new Date(startTime));
        const end = moment(_.isEmpty(endTime) ? new Date() : new Date(endTime));
        const duration = moment.duration(end.diff(start));
        const days = _.floor(duration.as('days'));
        const hours = _.floor(duration.as('hours'));
        const minutes = _.floor(duration.as('minutes'));
        const seconds = _.floor(duration.as('seconds'));
        return {
            days,
            hours: hours - days * 24,
            minutes: minutes - hours * 60,
            seconds: seconds - minutes * 60
        };
    }

    renderDuration() {
        const {duration} = this.state;
        return (
            <div>
                {duration.days > 0 ? <span>{duration.days} days</span> : ''}
                {duration.hours > 0 ? <span>{duration.hours} hours</span> : ''}
                {duration.minutes > 0 ? <span>{duration.minutes} mins</span> : ''}
                {duration.seconds > 0 ? <span>{duration.seconds} s</span> : ''}
            </div>
        );
    }

    componentWillUnmount() {
        clearInterval(this.infoTime);
    }

    static statusRender = (status, resultStatus) => {
        const _status = Task.getTaskStatus(status, resultStatus);
        let statusTag = <Tag color={"red"}>{ExperimentConstants.TASK_UNKNOWN.desc}</Tag>;
        switch (_status) {
            case ExperimentConstants.TASK_SUCCESS:
                statusTag = <Tag color={"green"}>{ExperimentConstants.TASK_SUCCESS.desc}</Tag>;
                break;
            case ExperimentConstants.TASK_FAILED:
                statusTag = <Tag color={"red"}>{ExperimentConstants.TASK_FAILED.desc}</Tag>;
                break;
            case ExperimentConstants.TASK_RUNNING:
                statusTag = <Badge status="processing" text={ExperimentConstants.TASK_RUNNING.desc}/>;
                break;
            case ExperimentConstants.TASK_WAIT:
                statusTag = <Tag color={"geekblue"}>{ExperimentConstants.TASK_WAIT.desc}</Tag>;
                break;
        }
        return statusTag;
    }

    render() {
        const {taskName, startTime, endTime, status, resultStatus} = this.props;
        return (
            <Descriptions column={1}>
                <Descriptions.Item label="实验名称">{taskName}</Descriptions.Item>
                <Descriptions.Item label="已运行时长">{this.renderDuration()}</Descriptions.Item>
                <Descriptions.Item label="任务状态">
                    {TaskInfo.statusRender(status, resultStatus)}
                </Descriptions.Item>
                <Descriptions.Item label="开始执行时间">{startTime}</Descriptions.Item>
                <Descriptions.Item label="任务结束时间">
                    {
                        endTime ? endTime :
                            <Badge status="processing" text="运行中"/>
                    }</Descriptions.Item>
            </Descriptions>
        );
    }
}

const mapStateToProps = state => {
    const task = state.taskDetail.toJS();
    return {
        taskName: task.taskName,
        phase: task.phase,
        startTime: task.startTime,
        endTime: task.endTime,
        status: task.status,
        resultStatus: task.resultStatus,
    }
}
const mapDispatchToProps = dispatch => {
    return {
        queryTaskResult: taskId => dispatch(Actions.queryTaskResult(taskId)),
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(TaskInfo);