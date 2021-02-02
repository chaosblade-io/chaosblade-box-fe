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
import MachineRegister from "../libs/MachineRegister";
import {Alert, Tabs, Typography} from "antd";
import {FormattedMessage} from "react-intl";

const {TabPane} = Tabs
const {Paragraph} = Typography


class ApplicationRegister extends React.Component {
    render() {
        return (
            <TabPane
                key="application"
                tab={<span><FormattedMessage id={"page.machine.register.tab.application"}/></span>}>
                <MachineRegister
                    config={[]}
                    description={
                        <Alert message={
                            <div>
                                <Paragraph>
                                    注册应用指平台感知主机的存在，用于对目标主机实现混沌实验，适用于非集群模式。实现方案是通过在目标主机部署探针，探针具备以下核心功能：<br/>
                                    · 上报主机信息注册到平台；<br/>
                                    · 维持心跳监控主机状态；<br/>
                                    · 部署混沌实验工具等；<br/>
                                    · 执行平台下发的混沌实验指令；<br/>
                                </Paragraph>
                                <Paragraph>
                                    主机探针的安装模式目前支持：通过 Ansible 或 SSH 实现远程安装；登录目标主机手动执行命令安装；
                                </Paragraph>
                            </div>
                        } type="info" closable/>
                    }/>
            </TabPane>
        );
    }

}

export default ApplicationRegister;