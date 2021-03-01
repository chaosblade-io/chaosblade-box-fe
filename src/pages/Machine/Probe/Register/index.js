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
                                                 <FormattedMessage id={"page.machine.register.host.tooltip.intro"}/><br/>
                                                 · <FormattedMessage id={"page.machine.register.host.tooltip.li1"}/><br/>
                                                 · <FormattedMessage id={"page.machine.register.host.tooltip.li2"}/><br/>
                                                 · <FormattedMessage id={"page.machine.register.host.tooltip.li3"}/><br/>
                                                 · <FormattedMessage id={"page.machine.register.host.tooltip.li4"}/><br/>
                                                 <p/>
                                               <FormattedMessage id={"page.machine.register.host.tooltip.support"}/>
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
                                           <FormattedMessage id={"page.machine.register.k8s.tooltip.intro"}/><br/><p/>
                                           <FormattedMessage id={"page.machine.register.k8s.tooltip.support"}/>
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
