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
import MachineConstants from "../../../constants/MachineConstants";
import {Col, Row, Table} from "antd";
import Actions from "../../../actions/Actions";
import {connect} from "react-redux";
import {getEmptyContent, getSearchForm} from "../../../libs/Search";
import {GenPagination} from "../../../libs/Pagination";
import styles from './Host.module.scss'
import {FormattedMessage} from "react-intl";
import MachineOperation from "../libs/MachineOperation";
import {Link} from "react-router-dom";
import _ from 'lodash';

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
        label: "机器状态",
        placeholder: "请选择机器状态",
        options: [
            MachineConstants.MACHINE_STATUS_ONLINE,
            MachineConstants.MACHINE_STATUS_OFFLINE,
            MachineConstants.MACHINE_STATUS_BANING
        ]
    },
    {
        key: "chaosed",
        name: "chaosed",
        label: "是否演练过",
        options: [
            {
                code: true,
                desc: '是',
            },
            {
                code: false,
                desc: '否'
            }
        ]
    }
]

class HostList extends React.Component {
    static defaultProps = {
        InputSearchFields: InputSearchFields,
        SelectSearchFields: SelectSearchFields,
    }
    formRef = React.createRef()
    HostColumns = [
        {
            title: <FormattedMessage id={"page.machine.host.column.title.index"}/>,
            key: "index",
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
        },
        {title: 'IP', dataIndex: 'ip', key: 'ip'},
        {
            title: <FormattedMessage id={"page.machine.host.column.title.version"}/>,
            dataIndex: 'version',
            key: 'version'
        },
        {
            title: <FormattedMessage id={'page.machine.host.column.title.status'}/>,
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => (
                <FormattedMessage id={MachineConstants.MACHINE_STATUS[text]}/>
            ),
        },
        {
            title: <FormattedMessage id={"page.machine.host.column.title.heartbeatTime"}/>,
            dataIndex: 'heartbeatTime',
            key: 'heartbeatTime'
        },
        {
            title: "演练工具",
            dataIndex: 'chaostools',
            key: 'chaostools',
            render: (text, record) => {
                let rows = []
                if (!_.isEmpty(text)) {
                    text.map(tools => {
                        rows.push(
                            <Row key={record.machineId}>
                                <Col><a onClick={() => {
                                }}>{tools.name}-{tools.version}</a></Col>
                            </Row>
                        )
                    })
                }
                return (
                    <div>
                        {_.isEmpty(rows) ?
                            <Link to={{
                                pathname: '/chaostools/market',
                                active: 'host',
                                machineId: record.machineId
                            }}>未安装</Link>
                            : rows}
                    </div>
                );
            }
        },
        {
            title: <FormattedMessage id={"page.machine.host.column.title.chaosed"}/>,
            dataIndex: 'chaosed',
            key: 'chaosed',
            render: (text) => {
                return text ? (<span>是</span>) : <span>否</span>
            }
        },
        {
            title: <FormattedMessage id={"page.machine.host.column.title.chaosTime"}/>,
            dataIndex: 'chaosTime',
            key: 'chaosTime'
        },

        {
            title: <FormattedMessage id={"page.machine.host.column.title.operation"}/>,
            dataIndex: 'operation',
            key: 'operation',
            render: (text, record) => {
                return (
                    <MachineOperation
                        dimension={"host"}
                        unbanMachine={this.props.unbanMachine.bind(this)}
                        banMachine={this.props.banMachine.bind(this)}
                        record={record}/>
                );
            }
        }
    ]

    constructor(props) {
        super(props);
        this.state = {
            query: props.query || {},
        };
    }

    componentDidMount() {
        const {query, page, pageSize, getMachinesForHostPageable, probeId} = this.props
        getMachinesForHostPageable({...query, page: page, pageSize: pageSize, probeId: probeId, original: "host"})
    }

    onFinish = (values) => {
        const {query, page, pageSize, getMachinesForHostPageable} = this.props
        getMachinesForHostPageable({...query, page: page, pageSize: pageSize, original: "host", ...values})
    };

    render() {
        const {loading, machines, page, total, pageSize, query, getMachinesForHostPageable} = this.props;
        return (
            <div>
                {getSearchForm(this)}
                <Table columns={this.HostColumns}
                       rowKey={record => record.machineId}
                       dataSource={loading ? [] : machines}
                       locale={{
                           emptyText: getEmptyContent(
                               <span>没有机器数据，请先在
                                   <Link to={{pathname: '/machine/register', active: 'host'}}>&nbsp;机器注册&nbsp;</Link>页面注册机器
                               </span>,
                               "查找不到机器", query)
                       }}
                       loading={loading}
                       pagination={GenPagination(page, pageSize, total,
                           (page, pageSize) => getMachinesForHostPageable({...query, page, pageSize})
                       )}
                />
            </div>
        )
    }
}

const mapStateToProps = state => {
    const machine = state.machine.toJS();
    const {hosts} = machine
    return {
        loading: hosts.loading,
        refreshing: hosts.refreshing,
        machines: hosts.machines,
        pageSize: hosts.pageSize,
        page: hosts.page,
        pages: hosts.pages,
        total: hosts.total,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getMachinesForHostPageable: query => dispatch(Actions.getMachinesForHostPageable({...query})),
        banMachine: machineId => dispatch(Actions.banMachine(machineId)),
        unbanMachine: machineId => dispatch(Actions.unbanMachine(machineId)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HostList);
