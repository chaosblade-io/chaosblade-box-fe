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
import Application from "./Application";
import {Tabs, Tooltip} from "antd";
import {
    AndroidOutlined,
    AppleOutlined,
    AppstoreAddOutlined,
    CloudOutlined, HddOutlined,
    QuestionCircleOutlined
} from "@ant-design/icons";
import Host from "./Host";
import Kubernetes from "./Kubernetes";
import {FormattedMessage} from "react-intl";
import {Link} from "react-router-dom";
import styles from './index.module.scss';

const {TabPane} = Tabs

class SiderDemo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            active: this.props.location.active || "host",
            probeId: this.props.location.probeId || "",
        };
    }

    onCollapse = collapsed => {
        this.setState({collapsed});
    };

    render() {
        const {active, probeId} = this.state;
        return (
            <div className={styles.machineStatistics}>
                <Tabs defaultActiveKey={active}>
                    <TabPane key="host" tab={
                        <span>
                        <HddOutlined /><FormattedMessage id={"page.machine.tab.host"}/>
                            &nbsp;
                            <Tooltip title={
                                <span><FormattedMessage id={"page.machine.tab.host.tooltip.hostList"}/><Link to={
                                    {pathname: '/machine/register', active: 'host'}
                                }><FormattedMessage id={"page.machine.tab.host.tooltip.machineRegister"}/></Link>
                                    <FormattedMessage id={"page.machine.tab.host.tooltip.probeInstall"}/></span>
                            }>
                                <QuestionCircleOutlined/>
                            </Tooltip>
                        </span>
                    }>
                        <Host probeId={probeId}/>
                    </TabPane>
                    <TabPane key="kubernetes"
                             tab={
                                 <span>
                                 <CloudOutlined/><FormattedMessage id={"page.machine.tab.kubernetes"}/>
                                     &nbsp;
                                     <Tooltip title={
                                         <span><FormattedMessage id={"page.machine.tab.kubernetes.tooltip.resources"}/>
                                             <Link to={
                                                 {pathname: '/machine/register', active: 'kubernetes'}
                                             }><FormattedMessage id={"page.machine.tab.host.tooltip.machineRegister"}/></Link>
                                             <FormattedMessage id={"page.machine.tab.kubernetes.tooltip.probe"}/></span>
                                     }>
                                <QuestionCircleOutlined/>
                            </Tooltip>
                             </span>
                             }>
                        <Kubernetes/>
                    </TabPane>
                    <TabPane key="application"
                             tab={
                                 <span>
                                 <AppstoreAddOutlined /><FormattedMessage id={"page.machine.tab.application"}/>
                                     &nbsp;
                                     <Tooltip title={
                                         <span>
                                             <FormattedMessage id={"page.machine.tab.application.tooltip.identity"}/><Link to={
                                             {pathname: '/machine/register', active: 'application'}
                                         }><FormattedMessage id={"page.machine.tab.host.tooltip.machineRegister"}/></Link>
                                         <FormattedMessage id={"page.machine.tab.application.tooltip.appRegister"}/>
                                             <p><FormattedMessage id={"page.machine.tab.application.tooltip.click"}/><Link to={
                                                 {pathname: '/machine/register', active: 'application'}
                                             }><FormattedMessage id={"page.machine.tab.application.tooltip.appIntroduction"}/></Link>
                                                 <FormattedMessage id={"page.machine.tab.application.tooltip.appDimensionInfo"}/></p>
                                         </span>
                                     }>
                                    <QuestionCircleOutlined/>
                                </Tooltip>
                             </span>
                             }>
                        <Application/>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}


export default SiderDemo;
