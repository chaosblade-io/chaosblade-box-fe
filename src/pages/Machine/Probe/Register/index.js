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
import {Tabs, Tooltip, Typography} from "antd";
import {FormattedMessage} from "react-intl";
import {QuestionCircleOutlined} from "@ant-design/icons";
import KubernetesRegister from "./Kubernetes/KubernetesRegister";
import HostRegister from "./Host/HostRegister";
import styles from './index.module.scss';

const {TabPane} = Tabs;
const {Paragraph} = Typography


class Register extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            active: this.props.location.active,
        }
    }

    render() {
        const {active} = this.state
        return (
            <div className={styles.registerHeader}>
                <Tabs defaultActiveKey={active ? active : "host"} onChange={(key) => {
                    this.setState({active: key})
                }}>
                    <TabPane key="host"
                             tab={
                                 <span>
                            <FormattedMessage id={"page.machine.register.tab.host"}/>
                                     &nbsp;
                                     <Tooltip
                                         autoAdjustOverflow
                                         placement="bottomLeft"
                                         title={
                                             <div>
                                                 注册主机指平台感知主机的存在，用于对目标主机实现混沌实验，适用于非集群模式。实现方案是通过在目标主机部署探针，探针具备以下核心功能：<br/>
                                                 · 上报主机信息注册到平台；<br/>
                                                 · 维持心跳监控主机状态；<br/>
                                                 · 部署混沌实验工具等；<br/>
                                                 · 执行平台下发的混沌实验指令；<br/>
                                                 <p/>
                                                 主机探针的安装模式目前支持：通过 Ansible 或 SSH 实现远程安装；登录目标主机手动执行命令安装；
                                             </div>
                                         }>
                                <QuestionCircleOutlined/>
                                </Tooltip>
                            </span>
                             }>
                        <HostRegister/>
                    </TabPane>
                    <TabPane key="kubernetes"
                             tab={
                                 <span><FormattedMessage id={"page.machine.register.tab.kubernetes"}/>
                                     &nbsp;
                                     <Tooltip title={
                                         <div>
                                             注册 Kubernetes 指获取集群 Pods、Nodes
                                             资源数据，方便创建实验时选择目标资源做混沌实验，无需手动填写资源名称等参数，适用于集群模式。
                                             实现方案是通过在集群里部署资源采集器探针，采集器探针具备以下核心功能：采集Pods、Nodes资源基础数据注册到平台；<br/>
                                             <p/>
                                             Kubernetes 探针的安装模式目前仅支持 Helm 安装方式。
                                         </div>
                                     } autoAdjustOverflow placement="bottomLeft">
                                        <QuestionCircleOutlined/>
                                    </Tooltip>
                        </span>}>
                        <KubernetesRegister/>
                    </TabPane>
                    <TabPane
                        key="application"
                        tab={<span><FormattedMessage id={"page.machine.register.tab.application"}/>
                        </span>}>
                        <h1>{<FormattedMessage id={"page.machine.register.info.waiting"}/>}</h1>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default Register;
