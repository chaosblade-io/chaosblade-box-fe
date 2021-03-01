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
import {Table} from 'antd';
import Actions from "../../../actions/Actions";
import {connect} from "react-redux";
import {getEmptyContent, getSearchForm} from "../../../libs/Search";
import {GenPagination} from "../../../libs/Pagination";
import MachineConstants from "../../../constants/MachineConstants";
import {FormattedMessage} from "react-intl";
import MachineOperation from "../libs/MachineOperation";
import styles from "../Kubernetes/index.module.scss";

const InputSearchFields = [
    {
        key: "appName",
        name: "appName",
        label: <FormattedMessage id={"page.machine.app.name"}/>,
        placeholder: "page.machine.app.name.placeholder"
    },
    {
        key: "groupName",
        name: "groupName",
        label: <FormattedMessage id={"page.machine.app.group"}/>,
        placeholder: "page.machine.app.group.placeholder"

    },
    {
        key: "hostname",
        name: "hostname",
        label: <FormattedMessage id={"page.machine.host.column.title.hostname"}/>,
        placeholder: "page.machine.host.column.title.hostname.placeholder"
    },
    {
        key: "ip",
        name: "ip",
        label: <FormattedMessage id={"page.machine.host.column.title.ip"}/>,
        placeholder: "page.machine.host.column.title.ip.placeholder"
    }
]

const SelectSearchFields = [
    {
        key: "type",
        name: "type",
        label: <FormattedMessage id={"page.machine.app.machineType"}/>,
        placeholder: <FormattedMessage id={"page.machine.app.machineType.placeholder"}/>,
        options: [
            MachineConstants.MACHINE_TYPE_HOST,
            MachineConstants.MACHINE_TYPE_POD,
            MachineConstants.MACHINE_TYPE_NODE
        ]
    },
    {
        key: "status",
        name: "status",
        label: <FormattedMessage id={"page.machine.app.machineStatus"}/>,
        placeholder: <FormattedMessage id={"page.machine.app.machineStatus.placeholder"}/>,
        options: [
            MachineConstants.MACHINE_STATUS_ONLINE,
            MachineConstants.MACHINE_STATUS_OFFLINE,
            MachineConstants.MACHINE_STATUS_BANING
        ]
    }
]

class ApplicationList extends React.Component {
    static defaultProps = {
        InputSearchFields: InputSearchFields,
        SelectSearchFields: SelectSearchFields,
    }
    formRef = React.createRef()
    TableColumns = [
        {
            title: <FormattedMessage id={"page.machine.host.column.title.index"}/>,
            render: (text, record, index) => `${index + 1}`
        },
        {
            title: <FormattedMessage id={"page.machine.host.column.title.machineId"}/>,
            dataIndex: "machineId",
            key: "machineId",
            className: `${styles.hidden}`
        },
        {
            title: <FormattedMessage id={"page.machine.host.column.title.hostname"}/>,
            dataIndex: 'hostname',
            key: 'hostname',
            render: text => <a>{text}</a>,
        },
        {
            title: <FormattedMessage id={"page.machine.host.column.title.ip"}/>,
            dataIndex: 'ip',
            key: 'ip',
        },
        {
            title: <FormattedMessage id={"page.machine.app.group"}/>,
            dataIndex: 'appName',
            key: 'appName',
        },
        {
            title: <FormattedMessage id={"page.machine.app.name"}/>,
            dataIndex: 'groupName',
            key: 'groupName',
        },
        {
            title: <FormattedMessage id={"page.machine.app.machineType"}/>,
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: <FormattedMessage id={"page.machine.host.column.title.heartbeatTime"}/>,
            dataIndex: 'modifyTime',
            key: 'modifyTime',
        },
        {
            title: <FormattedMessage id={"page.machine.app.machineStatus"}/>,
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => (
                <FormattedMessage id={MachineConstants.MACHINE_STATUS[text]}/>
            ),
        },
        {
            title: <FormattedMessage id={"page.machine.host.column.title.chaosed"}/>,
            dataIndex: 'chaosed',
            key: 'chaosed',
            render: text => {
                return text ? <FormattedMessage id={"select.option.true"}/> : <FormattedMessage id={"select.option.false"}/>
            },
        },
        {
            title: <FormattedMessage id={"page.machine.host.lastChaosedTime"}/>,
            dataIndex: 'chaosTime',
            key: 'chaosTime',
        },
        {
            title: <FormattedMessage id={"page.machine.host.column.title.operation"}/>,
            key: 'action',
            render: (text, record) => {
                return (
                    <MachineOperation
                        unbanMachine={this.props.unbanMachine.bind(this)}
                        banMachine={this.props.banMachine.bind(this)}
                        record={record}/>
                );
            }
        },
    ];

    constructor(props) {
        super(props);
        this.state = {
            query: props.query || {},
        };
    }

    componentDidMount() {
        const {query, page, pageSize, getMachinesForApplicationPageable} = this.props
        getMachinesForApplicationPageable({...query, page: page, pageSize: pageSize})
    }

    onFinish = (values) => {
        const {query, page, pageSize, getMachinesForApplicationPageable} = this.props
        getMachinesForApplicationPageable({...query, page: page, pageSize: pageSize, ...values})
        this.setState({query: values});
    };

    render() {
        const {loading, machines, page, total, pageSize, getMachinesForApplicationPageable} = this.props;
        const {query} = this.state;
        return (
            <div className="application-machine-table">
                {getSearchForm(this)}
                <Table columns={this.TableColumns}
                       rowKey="machineId"
                       dataSource={loading ? [] : machines}
                       primaryKey="machineId"
                       locale={{
                           emptyText: getEmptyContent("机器不存在", "查找不到机器", query)
                       }}
                       loading={loading}
                       pagination={GenPagination(page, pageSize, total,
                           (page, pageSize) => getMachinesForApplicationPageable({...query, page, pageSize}))}
                />
            </div>
        )
    }
}

const mapStateToProps = state => {
    const machine = state.machine.toJS();
    const {applications} = machine
    return {
        loading: machine.loading,
        machines: applications.machines,
        pageSize: applications.pageSize,
        page: applications.page,
        total: applications.total,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getMachinesForApplicationPageable: query => dispatch(Actions.getMachinesForApplicationPageable({
            ...query,
            original: "application"
        })),
        banMachine: machineId => dispatch(Actions.banMachine(machineId)),
        unbanMachine: machineId => dispatch(Actions.unbanMachine(machineId)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationList);
