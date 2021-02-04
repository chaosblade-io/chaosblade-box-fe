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
import {Table} from "antd";
import {getSearchForm} from '../../../libs/Search/index'
import Actions from "../../../actions/Actions";
import {connect} from "react-redux";
import {GenPagination} from "../../../libs/Pagination";
import {FormattedMessage} from "react-intl";
import MachineOperation from "../libs/MachineOperation";
import MachineConstants from "../../../constants/MachineConstants";
import styles from "./index.module.scss";

const NodeInputSearchField = [
    {
        key: "node",
        name: "node",
        label: "节点名",
        placeholder: "请填写节点名"
    },
    {
        key: "ip",
        name: "ip",
        label: "Node IP",
        placeholder: "请填写 Node IP"
    }
]

const SelectSearchField = [
    {
        key: "status",
        name: "status",
        label: "状态",
        placeholder: "请选择状态",
        options: [
            MachineConstants.MACHINE_STATUS_ONLINE,
            MachineConstants.MACHINE_STATUS_BANING,
        ]
    },
]

class NodeList extends React.Component {
    static defaultProps = {
        InputSearchFields: NodeInputSearchField,
        SelectSearchFields: SelectSearchField,
    }
    formRef = React.createRef()
    NodeColumns = [
        {
            title: <FormattedMessage id={"page.machine.host.column.title.index"}/>,
            index: "index",
            render: (text, record, index) => `${index + 1}`
        },
        {
            title: <FormattedMessage id={"page.machine.host.column.title.machineId"}/>,
            dataIndex: "machineId",
            key: "machineId",
            className: `${styles.hidden}`
        },
        {
            title: '节点名',
            dataIndex: 'nodeName',
            key: 'nodeName',
        },
        {
            title: '节点IP',
            dataIndex: 'nodeIp',
            key: 'nodeIp',
        },
        {
            title: '节点状态',
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
            title: '最近演练时间',
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
            },
        },
    ]

    constructor(props) {
        super(props);
        this.state = {
            query: props.query || {},
        };
    }

    componentDidMount() {
        const {query, page, pageSize, getMachinesForNodePageable} = this.props;
        getMachinesForNodePageable({...query, page: page, pageSize: pageSize})
    }

    onFinish = (values) => {
        const {query, page, pageSize, getMachinesForNodePageable} = this.props;
        getMachinesForNodePageable({...query, page: page, pageSize: pageSize, ...values})
    };

    render() {
        const {loading, page, pageSize, total, machines, query, getMachinesForNodePageable} = this.props
        return (
            <div>
                {getSearchForm(this)}
                <Table columns={this.NodeColumns}
                       dataSource={loading ? [] : machines}
                       rowKey="machineId"
                    // emptyContent={this.getEmptyContent(query)}
                       loading={loading}
                       pagination={GenPagination(page, pageSize, total,
                           (page, pageSize) => getMachinesForNodePageable({...query, page, pageSize}))}
                />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const machine = state.machine.toJS();
    let {nodes} = machine
    return {
        loading: machine.loading,
        machines: nodes.machines,
        pageSize: nodes.pageSize,
        page: nodes.page,
        total: nodes.total,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getMachinesForNodePageable: query => dispatch(Actions.getMachinesForNodePageable({...query, original: "node"})),
        banMachine: machineId => dispatch(Actions.banMachine(machineId)),
        unbanMachine: machineId => dispatch(Actions.unbanMachine(machineId)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeList)
