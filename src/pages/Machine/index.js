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
import {AndroidOutlined, AppleOutlined, QuestionCircleOutlined} from "@ant-design/icons";
import Host from "./Host";
import Kubernetes from "./Kubernetes";
import {FormattedMessage} from "react-intl";
import {Link} from "react-router-dom";
import './index.module.scss';

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
            <div>
                <Tabs defaultActiveKey={active}>
                    <TabPane key="host" tab={
                        <span>
                        <AppleOutlined/><FormattedMessage id={"page.machine.tab.host"}/>
                            &nbsp;
                            <Tooltip title={
                                <span>显示获取到的主机机器列表，可通过<Link to={
                                    {pathname: '/machine/register', active: 'host'}
                                }>机器注册</Link>页面安装探针进行机器注册。</span>
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
                                 <AndroidOutlined/><FormattedMessage id={"page.machine.tab.kubernetes"}/>
                                     &nbsp;
                                     <Tooltip title={
                                         <span>显示采集到的集群资源数据列表，可通过可通过
                                             <Link to={
                                                 {pathname: '/machine/register', active: 'kubernetes'}
                                             }>机器注册</Link>页面安装探针进行数据采集。</span>
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
                                 <AndroidOutlined/><FormattedMessage id={"page.machine.tab.application"}/>
                                     &nbsp;
                                     <Tooltip title={
                                         <span>
                                             显示具有应用标识的机器或者集群Pods、节点资源，可通过<Link to={
                                             {pathname: '/machine/register', active: 'application'}
                                         }>机器注册</Link>页面按照应用接入方式完成接入。
                                             <p>点击<Link to={
                                                 {pathname: '/machine/register', active: 'application'}
                                             }>应用介绍</Link>了解应用维度。</p>
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