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
        label: "应用名",
        placeholder: "请填写应用名"
    },
    {
        key: "groupName",
        name: "groupName",
        label: "应用分组",
        placeholder: "请填写应用分组名"

    },
    {
        key: "hostname",
        name: "hostname",
        label: "主机名",
        placeholder: "请填写主机名"
    },
    {
        key: "ip",
        name: "ip",
        label: "机器 IP",
        placeholder: "请填写机器 IP"
    }
]

const SelectSearchFields = [
    {
        key: "type",
        name: "type",
        label: "机器类型",
        placeholder: "请选择机器类型",
        options: [
            MachineConstants.MACHINE_TYPE_HOST,
            MachineConstants.MACHINE_TYPE_POD,
            MachineConstants.MACHINE_TYPE_NODE
        ]
    },
    {
        key: "status",
        name: "status",
        label: "机器状态",
        placeholder: "请选择机器状态",
        options: [
            MachineConstants.MACHINE_STATUS_ONLINE,
            MachineConstants.MACHINE_STATUS_OFFLINE,
            MachineConstants.MACHINE_STATUS_BANING
        ]
    }
]

class ApplicationList extends React.Component {
    formRef = React.createRef()

    static defaultProps = {
        InputSearchFields: InputSearchFields,
        SelectSearchFields: SelectSearchFields,
    }

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
    };

    render() {
        const {loading, machines, page, total, pageSize, query, getMachinesForApplicationPageable} = this.props;

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
            title: '机器名',
            dataIndex: 'hostname',
            key: 'hostname',
            render: text => <a>{text}</a>,
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            key: 'ip',
        },
        {
            title: '应用分组',
            dataIndex: 'appName',
            key: 'appName',
        },
        {
            title: '应用',
            dataIndex: 'groupName',
            key: 'groupName',
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: '心跳',
            dataIndex: 'modifyTime',
            key: 'modifyTime',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => (
                <FormattedMessage id={MachineConstants.MACHINE_STATUS[text]}/>
            ),
        },
        {
            title: '是否演练过',
            dataIndex: 'chaosed',
            key: 'chaosed',
            render: text => {
                return text ? '是' : '否'
            },
        },
        {
            title: '上次演练时间',
            dataIndex: 'chaosTime',
            key: 'chaosTime',
        },
        {
            title: '操作',
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
}

const mapStateToProps = state => {
    const machine = state.machine.toJS();
    const {applications} = machine
    return {
        loading: applications.loading,
        refreshing: applications.refreshing,
        machines: applications.machines,
        pageSize: applications.pageSize,
        page: applications.page,
        pages: applications.pages,
        total: applications.total,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getMachinesForApplicationPageable: query => dispatch(Actions.getMachinesForApplicationPageable(query)),
        banMachine: machineId => dispatch(Actions.banMachine(machineId)),
        unbanMachine: machineId => dispatch(Actions.unbanMachine(machineId)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationList);