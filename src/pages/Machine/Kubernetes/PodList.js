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
import {Col, Row, Table} from "antd";
import {getSearchForm} from "../../../libs/Search";
import {GenPagination} from "../../../libs/Pagination";
import Actions from "../../../actions/Actions";
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import MachineOperation from "../libs/MachineOperation";
import MachineConstants from "../../../constants/MachineConstants";
import styles from "./index.module.scss";
import _ from 'lodash';

const PodInputSearchField = [
    {
        key: "node",
        name: "node",
        label: <FormattedMessage id={"page.machine.k8s.node.name"}/>,
        placeholder: "page.machine.k8s.node.name.placeholder"
    },
    {
        key: "namespace",
        name: "namespace",
        label: <FormattedMessage id={"page.machine.k8s.namespace.name"}/>,
        placeholder: "page.machine.k8s.namespace.name.placeholder"
    },
    {
        key: "pod",
        name: "pod",
        label: <FormattedMessage id={"page.machine.k8s.pod.name"}/>,
        placeholder: "page.machine.k8s.pod.name.placeholder"
    },
    {
        key: "ip",
        name: "ip",
        label: <FormattedMessage id={"page.machine.k8s.pod.ip"}/>,
        placeholder: "page.machine.k8s.pod.ip.placeholder"
    }
]

const SelectSearchField = [
    {
        key: "status",
        name: "status",
        label: <FormattedMessage id={"page.machine.k8s.pod.status"}/>,
        placeholder: <FormattedMessage id={"page.machine.k8s.pod.status.placeholder"}/>,
        options: [
            MachineConstants.MACHINE_STATUS_ONLINE,
            MachineConstants.MACHINE_STATUS_BANING,
            MachineConstants.MACHINE_STATUS_OFFLINE,
        ]
    },
]

class PodList extends React.Component {
    static defaultProps = {
        InputSearchFields: PodInputSearchField,
        SelectSearchFields: SelectSearchField,
    }

    formRef = React.createRef()
    PodColumns = [
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
            title: <FormattedMessage id={"page.machine.k8s.node.name"}/>,
            dataIndex: 'nodeName',
            key: 'nodeName',
        },
        {
            title: 'Namespace',
            dataIndex: 'namespace',
            key: 'namespace',
        },
        {
            title: <FormattedMessage id={"page.machine.k8s.pod.name"}/>,
            dataIndex: 'podName',
            key: 'podName',
        },
        {
            title: <FormattedMessage id={"page.machine.k8s.pod.ip"}/>,
            dataIndex: 'podIp',
            key: 'podIp',
        },
        {
            title: <FormattedMessage id={"page.machine.k8s.pod.status"}/>,
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => (
                <FormattedMessage id={MachineConstants.MACHINE_STATUS[text]}/>
            ),
        },
        {
            title: <FormattedMessage id={"page.machine.k8s.pod.containerList"}/>,
            dataIndex: 'containers',
            key: 'containers',
            render: text => {
                if (_.isEmpty(text)) {
                    return;
                }
                return (
                    text.map(container => {
                        return (<Row><Col span={12}>{container.containerName}</Col></Row>);
                    })
                );
            }
        },
        {
            title: <FormattedMessage id={"page.machine.host.everChaosed"}/>,
            dataIndex: 'chaosed',
            key: 'chaosed',
            render: (text) => {
                return text ? (<span><FormattedMessage id={"select.option.true"}/></span>) : <span><FormattedMessage id={"select.option.false"}/></span>
            }
        },
        {
            title: <FormattedMessage id={"page.machine.host.lastChaosedTime"}/>,
            dataIndex: 'chaosTime',
            key: 'chaosTime',
        },
        {
            title: <FormattedMessage id={"page.machine.host.column.title.operation"}/>,
            dataIndex: 'operation',
            key: 'operation',
            render: (text, record) => {
                return (
                    <MachineOperation
                        dimension={"pod"}
                        unbanMachine={this.props.unbanMachine.bind(this)}
                        banMachine={this.props.banMachine.bind(this)}
                        record={record}/>
                );
            }
        },
    ]

    constructor(props) {
        super(props);
        this.state = {
            query: props.query || {},
        };
    }

    componentDidMount() {
        const {query, page, pageSize, getMachinesForPodPageable} = this.props;
        getMachinesForPodPageable({...query, page: page, pageSize: pageSize})
    }

    onFinish = (values) => {
        const {query, page, pageSize, getMachinesForPodPageable} = this.props
        getMachinesForPodPageable({...query, page: page, pageSize: pageSize, ...values})
        this.setState({query: values});
    };

    render() {
        const {loading, page, pageSize, total, machines, getMachinesForPodPageable} = this.props;
        const {query} = this.state;
        return (
            <div>
                {getSearchForm(this)}
                <Table columns={this.PodColumns}
                       dataSource={loading ? [] : machines}
                       rowKey="machineId"
                       loading={loading}
                       pagination={GenPagination(page, pageSize, total,
                           (page, pageSize) => getMachinesForPodPageable({...query, page, pageSize}))}
                />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const machine = state.machine.toJS();
    let {pods} = machine
    return {
        loading: machine.loading,
        machines: pods.machines,
        pageSize: pods.pageSize,
        page: pods.page,
        total: pods.total,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getMachinesForPodPageable: query => dispatch(Actions.getMachinesForPodPageable({...query, original: "pod"})),
        banMachine: machineId => dispatch(Actions.banMachine(machineId)),
        unbanMachine: machineId => dispatch(Actions.unbanMachine(machineId)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PodList)
