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

import MachineConstants from "../../../constants/MachineConstants";
import {message, Popconfirm, Space} from "antd";
import {FormattedMessage} from "react-intl";
import React from "react";
import _ from 'lodash'
import {Link} from "react-router-dom";
import * as request from "./request";

class MachineOperation extends React.Component {

    constructor(props) {
        super(props);
    }

    banMachine = (machineId, status, chaosRunning) => {
        const {banMachine} = this.props;
        if (chaosRunning && status == MachineConstants.MACHINE_STATUS_ONLINE.code) {
            return message.error('机器演练中，请停止演练后再禁用！', 2, onclose);
        }
        banMachine(machineId);
    }

    render() {
        const {unbanMachine, record, dimension} = this.props;
        const {machineId, status, chaosRunning, taskId, taskStatus, ip, machineType} = record;
        const taskInfo = !_.isEmpty(taskId) ?
            <a href={`/experiment/task/?${request.generateUrlSearch({id: taskId})}`}>查看实验</a> : <span></span>
        if (status === MachineConstants.MACHINE_STATUS_ONLINE.code) {
            return (
                <Space size="middle">
                    <Popconfirm
                        placement="top"
                        title={<FormattedMessage id={"page.machine.host.column.operation.ban.pop.title"}/>}
                        onConfirm={() => this.banMachine(machineId, status, chaosRunning)}
                        okText={<FormattedMessage id={"page.popconfirm.ok"}/>}
                        cancelText={<FormattedMessage id={"page.popconfirm.cancel"}/>}
                    >
                        <a><FormattedMessage id={"page.machine.host.column.operation.ban.name"}/></a>
                    </Popconfirm>
                    {
                        !chaosRunning ?
                            <>
                                <Link to={{
                                    pathname: '/experiment/creating',
                                    dimension: dimension,
                                    machineId: machineId,
                                    machineIp: ip,
                                    machineType: machineType,
                                }}><FormattedMessage
                                    id={"page.machine.host.column.operation.experiment.creating"}/></Link>
                                {taskInfo}
                            </>
                            :
                            <a href={`/experiment/task/?${request.generateUrlSearch({id: taskId})}`}><FormattedMessage
                                id={"page.machine.host.column.operation.experiment.running"}/></a>
                    }
                </Space>

            );
        } else if (status === MachineConstants.MACHINE_STATUS_BANING.code) {
            return (
                <Space size="middle">
                    <Popconfirm
                        placement="top"
                        title={<FormattedMessage id={"page.machine.host.column.operation.unban.pop.title"}/>}
                        onConfirm={() => unbanMachine(machineId)}
                        okText={<FormattedMessage id={"page.popconfirm.ok"}/>}
                        cancelText={<FormattedMessage id={"page.popconfirm.cancel"}/>}
                    >
                        <a><FormattedMessage id={"page.machine.host.column.operation.unban.name"}/></a>
                    </Popconfirm>
                    {taskInfo}
                </Space>
            );
        }
        return (
            <Space size="middle">{taskInfo}</Space>
        );
    }
}

export default MachineOperation;

