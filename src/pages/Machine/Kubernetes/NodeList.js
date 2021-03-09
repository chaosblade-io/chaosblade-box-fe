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
        label: <FormattedMessage id={"page.machine.k8s.node.name"}/>,
        placeholder: "page.machine.k8s.node.name.placeholder"
    },
    {
        key: "ip",
        name: "ip",
        label: <FormattedMessage id={"page.machine.k8s.node.ip"}/>,
        placeholder: "page.machine.k8s.node.ip.placeholder"
    }
]

const SelectSearchField = [
    {
        key: "status",
        name: "status",
        label: <FormattedMessage id={"page.machine.k8s.node.status"}/>,
        placeholder: <FormattedMessage id={"page.machine.k8s.node.status.placeholder"}/>,
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
            title: <FormattedMessage id={"page.column.title.index"}/>,
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
            title: <FormattedMessage id={"page.machine.k8s.node.name"}/>,
            dataIndex: 'nodeName',
            key: 'nodeName',
        },
        {
            title: <FormattedMessage id={"page.machine.k8s.node.ip"}/>,
            dataIndex: 'nodeIp',
            key: 'nodeIp',
        },
        {
            title: <FormattedMessage id={"page.machine.k8s.node.status"}/>,
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => (
                <FormattedMessage id={MachineConstants.MACHINE_STATUS[text]}/>
            ),
        },
        {
            title: <FormattedMessage id={"page.machine.host.everChaosed"}/>,
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
        this.setState({query: values});
    };

    render() {
        const {loading, page, pageSize, total, machines, getMachinesForNodePageable} = this.props
        const {query} = this.state;
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
