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
            bladeDeployedSwitch: true,
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
        this.setState({appSwitch: checked});
    }

    bladeDeployedSwitch = checked => {
        this.setState({bladeDeployedSwitch: checked});
    };

    installProbe = (selectedRowKeys, applications) => {
        const {installProbeByAnsible} = this.props;
        const {bladeDeployedSwitch} = this.state;
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
        installProbeByAnsible({probeType: "host", probes: probes, deployBlade: bladeDeployedSwitch})
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
        {title: <FormattedMessage id={"page.machine.host.info"}/>, dataIndex: "host", key: "host"},
        {
            title: <FormattedMessage id={"page.machine.host.register.status.title"}/>, dataIndex: "status", key: "status", render: text => {
                switch (text) {
                    case 0:
                        return <FormattedMessage id={"page.machine.host.register.status.option.uninstall"}/>;
                    case 1:
                        return <FormattedMessage id={"page.machine.host.register.status.option.installing"}/>;
                    case -1:
                        return <FormattedMessage id={"page.machine.host.register.status.option.installFailed"}/>;
                    case 2:
                        return <FormattedMessage id={"page.machine.host.register.status.option.installed"}/>;
                    case 3:
                        return <FormattedMessage id={"page.machine.host.register.status.option.offline"}/>;
                    case 9:
                        return <FormattedMessage id={"page.machine.host.register.status.disabled"}/>;
                }
            }
        },
        {
            title: <FormattedMessage id={"page.machine.host.column.title.operation"}/>, dataIndex: "operation", key: "operation", render: (text, record) => {
                const {status} = record
                return (
                    <Space size="middle">
                        <span>
                            {status === 1 || status === 2 || status === 9 ? '--' :
                                <a onClick={this.triggerProbe.bind(this, record)}><FormattedMessage id={"page.machine.host.register.install"}/></a>
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
        const {current, appSwitch, bladeDeployedSwitch, formVisible, selectedRowKeys} = this.state;
        return (
            <Steps direction="vertical" current={current}>
                <Step title={<FormattedMessage id={"page.machine.ansible.configuration"}/>} description={
                    <div>
                        <FormattedMessage id={"page.machine.ansible.configuration.info1"}/>
                        <a href={"https://docs.ansible.com/ansible/latest/index.html"}
                           target="_blank">&nbsp;Ansible&nbsp;</a><FormattedMessage id={"page.machine.ansible.configuration.info2"}/>&nbsp;&nbsp;
                        <Button size={"small"} type="primary" onClick={() => this.syncAnsibleHosts()}>
                            <FormattedMessage id={"page.machine.ansible.machine.sync"}/></Button>
                    </div>
                }>
                </Step>
                <Step title=<FormattedMessage id={"page.machine.register.install.title"}/> description={
                    <div>
                        <span>
                            <FormattedMessage id={"page.machine.register.install.info.trigger"}/>&nbsp;
                            <Switch checkedChildren={<FormattedMessage id={"button.text.on"}/>}
                                    unCheckedChildren={<FormattedMessage id={"button.text.off"}/>}
                                    defaultChecked={appSwitch}
                                    onChange={this.applicationSwitch}/>&nbsp;
                            <FormattedMessage id={"page.machine.register.install.info.moreDetail"}/>
                            <a onClick={() => {
                                console.log(<FormattedMessage id={"page.machine.register.redirect.installPage"}/>)
                            }}><FormattedMessage id={"page.machine.register.redirect.installInstruction"}/></a>。
                            <br/>
                            <FormattedMessage id={"page.machine.register.install.info.defaultStatus"}/>&nbsp;
                            <Switch checkedChildren={<FormattedMessage id={"button.text.on"}/>}
                                    unCheckedChildren={<FormattedMessage id={"button.text.off"}/>}
                                    defaultChecked={bladeDeployedSwitch}
                                    onChange={this.bladeDeployedSwitch}/>&nbsp;
                            <FormattedMessage id={"page.machine.register.install.info.chaosBlade"}/>
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
                                   emptyText: getEmptyContent(<span><a><FormattedMessage id={"page.machine.register.noMachine"}/></a></span>, "查找不到机器", null)
                               }}
                               pagination={false}
                        />
                    </div>
                }/>
                <Step title={<FormattedMessage id={"page.machine.ansible.view.install.info"}/>} description={
                    <div>
                        <FormattedMessage id={"page.machine.ansible.info.notice"}/>
                        <Table columns={TableColumnsResult}
                               dataSource={probesInstallations}
                               locale={{emptyText: <span><FormattedMessage id={"page.machine.host.noResults"}/></span>}}
                               rowKey={record => record.probeId}
                               pagination={false}
                        />
                        <FormattedMessage id={"page.machine.host.bottom.click"}/>
                        <Link to={{pathname: '/machine/probe'}}>
                            <FormattedMessage id={"page.machine.host.bottom.detail"}/>
                        </Link>
                        <FormattedMessage id={"page.machine.host.bottom.listAll"}/>
                    </div>
                }/>
            </Steps>
        );
    }

}

const TableColumnsResult = [
    {
        title: <FormattedMessage id={"page.machine.host.info"}/>, dataIndex: "host", key: "host", render: (text, record) => {
            let host = record.host || record.ip || record.hostname;
            return (<span>{host}</span>);
        }
    },
    {
        title: <FormattedMessage id={"page.machine.host.column.title.agentStatus"}/> , dataIndex: "status", key: "status", render: (text, record) => (
            <FormattedMessage id={MachineConstants.MACHINE_STATUS[text]}/>
        ),
    },
    {
        title: <FormattedMessage id={"page.machine.host.errorMessage"}/>, dataIndex: "error", key: "error"
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
        clearAnsibleRegister: () => dispatch(Actions.clearAnsibleRegisterResult()),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AnsibleRegister);
