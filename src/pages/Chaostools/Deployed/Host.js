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
import Actions from "../../../actions/Actions";
import {FormattedMessage} from "react-intl";
import styles from "../../Machine/Host/Host.module.scss";
import MachineConstants from "../../../constants/MachineConstants";
import _ from "lodash";
import {Col, Popconfirm, Row, Space, Table} from "antd";
import {getEmptyContent, getSearchForm} from "../../../libs/Search";
import {Link} from "react-router-dom";
import {GenPagination} from "../../../libs/Pagination";

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
]

class Host extends React.Component {

    static defaultProps = {
        InputSearchFields: InputSearchFields,
        SelectSearchFields: SelectSearchFields,
    }
    formRef = React.createRef()

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const {query, page, pageSize, getMachinesForHostPageable, probeId} = this.props
        getMachinesForHostPageable({...query, page: page, pageSize: pageSize, probeId: probeId, original: "host"})
    }

    operationWrapperRender = (operationFunc, text) => {
        let content = text;
        let confirm = operationFunc;
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

    deploy = (machineId) => {
        const toolsName = "chaosblade";
        const toolsVersion = "0.9.0";
        const toolsUrl = "https://chaosblade.oss-cn-hangzhou.aliyuncs.com/agent/github/0.9.0/chaosblade-0.9.0-linux-amd64.tar.gz";
        const {deployChaostoolsToHost} = this.props;
        deployChaostoolsToHost({name: toolsName, version: toolsVersion, machineId: machineId, url: toolsUrl})
    }

    upgrade = (machineId) => {
        const toolsName = "chaosblade";
        const toolsVersion = "0.9.0";
        const toolsUrl = "https://chaosblade.oss-cn-hangzhou.aliyuncs.com/agent/github/0.9.0/chaosblade-0.9.0-linux-amd64.tar.gz";
        const {upgradeChaostoolsToHost} = this.props;
        upgradeChaostoolsToHost({name: toolsName, version: toolsVersion, machineId: machineId, url: toolsUrl});
    }

    undeploy = (machineId) => {
        const {undeployChaostoolsForHost} = this.props;
        const toolsName = "chaosblade";
        const toolsVersion = "0.9.0";
        undeployChaostoolsForHost({name: toolsName, version: toolsVersion, machineId: machineId});
    }

    TableColumns = [
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
            title: <FormattedMessage id={'page.machine.host.column.title.status'}/>,
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => (
                <FormattedMessage id={MachineConstants.MACHINE_STATUS[text]}/>
            ),
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
                            <Row>
                                <Col><a onClick={() => {
                                }}>{tools.name}-{tools.version}</a></Col>
                            </Row>
                        )
                    })
                }
                return (
                    <div>
                        {_.isEmpty(rows) ?
                            '未安装'
                            : rows}
                    </div>
                );
            }
        },
        {
            title: <FormattedMessage id={"page.machine.host.column.title.operation"}/>,
            dataIndex: 'operation',
            key: 'operation',
            render: (text, record) => {
                return (
                    <Space size={"middle"}>
                        {this.operationWrapperRender(this.deploy.bind(this, record.machineId), '部署')}
                        {this.operationWrapperRender(this.undeploy.bind(this, record.machineId), '卸载')}
                    </Space>
                );
            }
        }
    ];

    render() {
        const {loading, machines, page, total, pageSize, query, getMachinesForHostPageable} = this.props;
        return (
            <div>
                {getSearchForm(this)}
                <Table columns={this.TableColumns}
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
        );
    }
}

const mapStateToProps = state => {
    const chaostoolsDeploy = state.chaostoolsDeploy.toJS();
    const {hosts} = chaostoolsDeploy
    return {
        loading: chaostoolsDeploy.loading,
        refreshing: hosts.refreshing,
        machines: hosts.machines,
        pageSize: hosts.pageSize,
        page: hosts.page,
        pages: hosts.pages,
        total: hosts.total,
    };
}
const mapDispatchToProps = dispatch => {
    return {
        getMachinesForHostPageable: query => dispatch(Actions.getMachinesForHostPageable({...query})),
        deployChaostoolsToHost: tools => dispatch(Actions.deployChaostoolsToHost(tools)),
        undeployChaostoolsForHost: tools => dispatch(Actions.undeployChaostoolsForHost(tools)),
        upgradeChaostoolsToHost: tools => dispatch(Actions.upgradeChaostoolsToHost(tools)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Host);