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
import {Timeline} from "antd";
import Actions from "../../../actions/Actions";
import {connect} from "react-redux";
import Task from "./index";
import {ExperimentConstants} from "../../../constants/ExperimentConstants";
import {default as AnsiUp} from 'ansi_up';

class TaskLogging extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const {queryTaskLog} = this.props;
        const taskId = Task.getTaskId();
        this.logTime = setInterval(() => {
            queryTaskLog(taskId);
        }, 3000)
    }

    componentWillUnmount() {
        clearInterval(this.logTime);
    }

    logRender() {
        const {logging} = this.props;
        const ansi_up = new AnsiUp();
        let logs = [];
        logging.map(log => {
            logs.push(
                <Timeline.Item>
                    <div dangerouslySetInnerHTML={{__html: ansi_up.ansi_to_html(log)}} />
                </Timeline.Item>
            )
        });
        return logs;
    }

    render() {
        const {resultStatus} = this.props;
        const pending = resultStatus === ExperimentConstants.TASK_RESULT_STATUS_NULL.code ? '执行中' : null;
        return (
            <div>
                <Timeline pending={pending} reverse>
                    {this.logRender()}
                </Timeline>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const task = state.taskDetail.toJS();
    return {
        status: task.status,
        resultStatus: task.resultStatus,
        logging: task.logging,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        queryTaskLog: (taskId) => dispatch(Actions.queryTaskLog(taskId))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TaskLogging);