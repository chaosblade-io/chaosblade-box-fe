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
import {connect} from "react-redux";
import Actions from "../../../../actions/Actions";
import {getEmptyContent, getSearchForm} from "../../../../libs/Search";
import MachineConstants from "../../../../constants/MachineConstants";
import {Popconfirm, Space, Table} from "antd";
import {GenPagination} from "../../../../libs/Pagination";
import {FormattedMessage} from "react-intl";
import {Link} from "react-router-dom";
import styles from "../../Host/Host.module.scss";
import ProbeConstants from "../../../../constants/ProbeConstants";

const InputSearchFields = [
    {
        key: "hostname",
        name: "hostname",
        label: "主机名",
        placeholder: "请填写主机名"
    },
    {
        key: "ip",
        name: "ip",
        label: "IP地址",
        placeholder: "请填写IP地址"
    },
]

const SelectSearchFields = [
    {
        key: "status",
        name: "status",
        label: "探针状态",
        placeholder: "请选择探针状态",
        options: [
            MachineConstants.MACHINE_STATUS_ONLINE,
            MachineConstants.MACHINE_STATUS_OFFLINE,
            MachineConstants.MACHINE_STATUS_BANING
        ]
    },
    {
        key: "agentType",
        name: "agentType",
        label: "探针类型",
        options: [
            ProbeConstants.PROBE_TYPE_HOST,
            ProbeConstants.PROBE_TYPE_KUBERNETES,
        ]
    }
]

class ProbeList extends React.Component {

    static defaultProps = {
        InputSearchFields: InputSearchFields,
        SelectSearchFields: SelectSearchFields,
    }
    formRef = React.createRef()

    constructor(props) {
        super(props);
        this.state = {
            query: props.query || {},
        };
    }

    componentDidMount() {
        const {query, page, pageSize, getProbesPageable} = this.props
        getProbesPageable({...query, page: page, pageSize: pageSize})
    }

    onFinish = (values) => {
        const {query, page, pageSize, getProbesPageable} = this.props
        getProbesPageable({...query, page: page, pageSize: pageSize, ...values})
        this.setState({query: values});
    };

    installProbe = (probeId) => {
        const {installProbe} = this.props;
        installProbe({probeId: probeId});
    }

    banProbe = (probeId) => {
        const {banProbe} = this.props;
        banProbe({probeId: probeId});
    }

    unbanProbe = probeId => {
        const {unbanProbe} = this.props;
        unbanProbe({probeId: probeId});
    }

    uninstallProbe = (probeId) => {
        const {uninstallProbe} = this.props;
        uninstallProbe({probeId: probeId});
    }

    operationWrapperRender = (operationFunc, text, agentType) => {
        let content = text;
        let confirm = operationFunc;
        if (agentType === ProbeConstants.PROBE_TYPE_KUBERNETES.code) {
            content = "请使用 Helm 命令手动删除";
            confirm = () => {
            }
        }
        return (
            <Popconfirm
                placement="top"
                title={content}
                onConfirm={() => confirm()}
                okText={<FormattedMessage id={"page.popconfirm.ok"}/>}
                cancelText={<FormattedMessage id={"page.popconfirm.cancel"}/>}
            >
                <a>{text}</a>
            </Popconfirm>
        );
    }

    TableColumns = [
        {
            title: <FormattedMessage id={"page.machine.host.column.title.index"}/>,
            key: "index",
            render: (text, record, index) => `${index + 1}`
        },
        {
            title: <FormattedMessage id={"page.machine.host.column.title.agentId"}/>,
            dataIndex: "probeId",
            key: "probeId",
            className: `${styles.hidden}`
        },
        {title: <FormattedMessage id={"page.machine.host.column.title.hostname"}/>, dataIndex: "hostname", key: "hostname"},
        {title: 'IP', dataIndex: "ip", key: "ip"},
        {
            title: <FormattedMessage id={"page.machine.host.column.title.agentStatus"}/>, dataIndex: "status", key: "status",
            render: (text, record) => (
                <FormattedMessage id={MachineConstants.MACHINE_STATUS[text]}/>
            ),
        },
        {title: <FormattedMessage id={"page.machine.host.column.title.agentVersion"}/>, dataIndex: "version", key: "version"},
        {
            title: <FormattedMessage id={"page.machine.host.column.title.agentType"}/>, dataIndex: "agentType", key: "agentType", render: (text, record) => {
                return <span>{ProbeConstants.PROBE_TYPES[text]}</span>
            }
        },
        {title: <FormattedMessage id={"page.machine.host.column.title.installTime"}/>, dataIndex: "createTime", key: "createTime"},
        {title: <FormattedMessage id={"page.machine.host.column.title.heartbeatTime"}/>, dataIndex: "heartbeatTime", key: "heartbeatTime"},
        {
            title: <FormattedMessage id={"page.machine.host.column.title.relatedMachine"}/>,
            dataIndex: "relatedMachine", key: "relatedMachine",
            render: (text, record) => (<span><Link to={
                {
                    pathname: '/machine/list',
                    probeId: record.probeId,
                    active: ProbeConstants.PROBE_TYPES[record.agentType],
                }
            }><FormattedMessage id={"page.machine.host.column.detail"}/></Link></span>)
        },
        {
            title: <FormattedMessage id={"page.machine.host.column.title.operation"}/>, dataIndex: "operation", key: "operation", render: (text, record) => {
                const probeId = record.probeId;
                const operations = [];
                if (record.status === MachineConstants.MACHINE_STATUS_OFFLINE.code ||
                    record.status === MachineConstants.MACHINE_STATUS_INSTALL_FAILED.code) {
                    operations.push(<Link to={{pathname: '/machine/register'}}>
                        <FormattedMessage id={"page.machine.host.column.operation.reinstall"}/></Link>);
                }
                if (record.status === MachineConstants.MACHINE_STATUS_BANING.code) {
                    operations.push(this.operationWrapperRender(this.unbanProbe.bind(this, probeId),
                      <FormattedMessage id={"page.machine.host.column.operation.unban.name"}/>, record.agentType));
                    operations.push(this.operationWrapperRender(this.uninstallProbe.bind(this, probeId),
                      <FormattedMessage id={"page.machine.host.column.operation.uninstall"}/>, record.agentType));
                }
                if (record.status === MachineConstants.MACHINE_STATUS_ONLINE.code) {
                    operations.push(this.operationWrapperRender(this.banProbe.bind(this, probeId),
                      <FormattedMessage id={"page.machine.host.column.operation.ban.name"}/>, record.agentType));
                    operations.push(this.operationWrapperRender(this.uninstallProbe.bind(this, probeId),
                      <FormattedMessage id={"page.machine.host.column.operation.uninstall"}/>, record.agentType));
                }
                return (
                    <Space size="middle">
                        {operations ? operations : '--'}
                    </Space>
                );
            },
        },
    ]

    render() {
        const {loading, probes, page, total, pageSize, getProbesPageable} = this.props;
        const {query} = this.state;
        return (
            <div>
                {getSearchForm(this)}
                <Table columns={this.TableColumns}
                       dataSource={loading ? [] : probes}
                       locale={{
                           emptyText: getEmptyContent(<span><FormattedMessage id={"page.machine.host.probe.not.found.guide"}/><Link to={
                               {pathname: '/machine/register'}
                           }><FormattedMessage id={"page.machine.host.column.operation.install"}/></Link></span>,
                             <FormattedMessage id={"page.machine.host.probe.not.found"}/>, query)
                       }}
                       rowKey={record => record.probeId}
                       loading={loading}
                       pagination={GenPagination(page, pageSize, total,
                           (page, pageSize) => getProbesPageable({...query, page, pageSize})
                       )}
                />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const probe = state.probe.toJS();
    return {
        loading: probe.loading,
        page: probe.page,
        pageSize: probe.pageSize,
        probes: probe.probes,
        total: probe.total,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getProbesPageable: query => dispatch(Actions.getProbesPageable(query)),
        banProbe: probeId => dispatch(Actions.banProbe(probeId)),
        unbanProbe: probeId => dispatch(Actions.unbanProbe(probeId)),
        uninstallProbe: probeId => dispatch(Actions.uninstallProbe(probeId)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProbeList)
