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
import {Button, Space, Steps, Switch, Table} from "antd";
import Actions from "../../../../../actions/Actions";
import {getEmptyContent} from "../../../../../libs/Search";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import ApplicationForm from "./ApplicationForm";
import _ from 'lodash';
import {FormattedMessage} from "react-intl";
import MachineConstants from "../../../../../constants/MachineConstants";

const {Step} = Steps

class AnsibleRegister extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            current: 0,
            appSwitch: false,
            formVisible: false,
            selectedRowKeys: [],
            loading: false,
        }
    }

    syncAnsibleHosts() {
        const {getAnsibleHosts, clearAnsibleRegister} = this.props;
        clearAnsibleRegister();
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.setState({current: 1})
        getAnsibleHosts()
    }

    applicationSwitch = (checked) => {
        this.setState({appSwitch: checked})
    }

    installProbe = (selectedRowKeys, applications) => {
        const {installProbeByAnsible} = this.props;
        let command = [];
        if (!_.isEmpty(applications)) {
            const {appName, groupName} = applications;
            command.push('-p', appName, '-g', groupName)
        }
        const probes = [];
        selectedRowKeys.map(host => {
            probes.push({
                host: host,
                command: _.join(command, " "),
            });
        });
        installProbeByAnsible({probeType: "host", probes: probes})

        this.setState({current: 2})
        this.queryProbes()
    }

    queryProbes = () => {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.interval = setInterval(() => {
            const {queryProbesInstallation, ansibleInstallations} = this.props;
            if (!_.isEmpty(ansibleInstallations)) {
                let probeIds = [];
                ansibleInstallations.map(item => {
                    probeIds.push(item.probeId);
                })
                queryProbesInstallation({probeIds: probeIds});
            }
        }, 1000);
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    triggerProbe = (record) => {
        const selectedRowKeys = [...this.state.selectedRowKeys];
        if (selectedRowKeys.indexOf(record.host) < 0) {
            selectedRowKeys.push(record.host);
        }
        this.setState({selectedRowKeys});

        if (this.state.appSwitch) {
            return this.setState({formVisible: true});
        }
        return this.installProbe(selectedRowKeys);
    }

    TableColumns = [
        {title: '主机信息', dataIndex: "host", key: "host"},
        {
            title: '注册状态', dataIndex: "status", key: "status", render: text => {
                switch (text) {
                    case 0:
                        return '未安装';
                    case 1:
                        return '安装中';
                    case -1:
                        return '安装失败';
                    case 2:
                        return '已安装';
                    case 3:
                        return '离线';
                    case 9:
                        return '已禁用';
                }
            }
        },
        {
            title: '操作', dataIndex: "operation", key: "operation", render: (text, record) => {
                const {status} = record
                return (
                    <Space size="middle">
                        <span>
                            {status === 1 || status === 2 || status === 9 ? '--' :
                                <a onClick={this.triggerProbe.bind(this, record)}>安装</a>
                            }
                        </span>
                    </Space>
                );
            }
        },
    ]

    onFormVisibleChange = (visible) => {
        this.setState({formVisible: visible})
    }

    onSelectChange = selectedRowKeys => {
        this.setState({selectedRowKeys});
    };

    render() {
        const {
            ansibleHosts,
            ansibleInstallations,
            probesInstallations,
            ansibleHostsLoading,
            ansibleInstallationsLoading,
            probesInstallationsLoading
        } = this.props;
        const {current, appSwitch, formVisible} = this.state;
        const {loading, selectedRowKeys} = this.state;
        return (
            <Steps direction="vertical" current={current}>
                <Step title="配置Ansible" description={
                    <div>
                        请在控制台服务所部署的机器配置
                        <a href={"https://docs.ansible.com/ansible/latest/index.html"}
                           target="_blank">&nbsp;Ansible&nbsp;</a>，配置完成后，点击下方的按钮同步配置信息到平台。&nbsp;&nbsp;
                        <Button size={"small"} type="primary" onClick={() => this.syncAnsibleHosts()}>同步机器信息</Button>
                    </div>
                }>
                </Step>
                <Step title="选择机器安装" description={
                    <div>
                        <span>
                            选择下列机器进行安装，在安装时可以触发
                            &nbsp;<Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked={false}
                                          onChange={this.applicationSwitch}/>&nbsp;
                            开关选择是否开启或关闭应用信息配置，更多的应用信息介绍详见：
                            <a onClick={() => {
                                console.log("跳转到应用接入页面")
                            }}>应用接入说明</a>
                        </span>
                        <ApplicationForm visible={formVisible}
                                         hosts={selectedRowKeys}
                                         install={this.installProbe.bind(this)}
                                         onChange={this.onFormVisibleChange.bind(this)}/>
                        <Table columns={this.TableColumns}
                               dataSource={ansibleHosts}
                               loading={ansibleHostsLoading || ansibleInstallationsLoading}
                               rowSelection={{selectedRowKeys, onChange: this.onSelectChange,}}
                               rowKey={record => record.host}
                               locale={{
                                   emptyText: getEmptyContent(<span><a>机器不存在</a></span>, "查找不到机器", null)
                               }}
                               pagination={false}
                        />
                    </div>
                }/>
                <Step title="查看安装详情" description={
                    <div>
                        定时刷新结果，可以在探针管理页面查看
                        <Table columns={TableColumnsResult}
                               dataSource={probesInstallations}
                               locale={{emptyText: <span>无返回结果</span>}}
                               rowKey={record => record.probeId}
                               pagination={false}
                        />
                        你也可以点击
                        <Link to={{pathname: '/machine/probe'}}>
                            详情
                        </Link>
                        查看全部的探针列表
                    </div>
                }/>
            </Steps>
        );
    }

}

const TableColumnsResult = [
    {
        title: '主机信息', dataIndex: "host", key: "host", render: (text, record) => {
            let host = record.host || record.ip || record.hostname;
            return (<span>{host}</span>);
        }
    },
    {
        title: '探针状态', dataIndex: "status", key: "status", render: (text, record) => (
            <FormattedMessage id={MachineConstants.MACHINE_STATUS[text]}/>
        ),
    },
    {
        title: '错误信息', dataIndex: "error", key: "error"
    },
]

const mapStateToProps = state => {
    const register = state.register.toJS();
    return {
        ansibleHostsLoading: register.ansibleHostsLoading,
        ansibleHosts: register.ansibleHosts,
        ansibleInstallationsLoading: register.ansibleInstallationsLoading,
        ansibleInstallations: register.ansibleInstallations,
        probesInstallationsLoading: register.probesInstallationsLoading,
        probesInstallations: register.probesInstallations,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getAnsibleHosts: () => dispatch(Actions.getAnsibleHosts()),
        installProbeByAnsible: (values) => dispatch(Actions.installProbeByAnsible(values)),
        queryProbesInstallation: (probeIds) => dispatch(Actions.queryProbesInstallation(probeIds)),
        clearAnsibleRegister: () => dispatch(Actions.clearAnsibleRegisterResult())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AnsibleRegister);