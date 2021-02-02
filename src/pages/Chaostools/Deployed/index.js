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
import {Tabs} from "antd";
import Kubernetes from "./Kubernetes";
import Host from "./Host";
import queryString from "query-string";

const {TabPane} = Tabs

class ChaostoolsDeployed extends React.Component {

    constructor(props) {
        super(props);
    }

    static getName() {
        const parsed = queryString.parse(window.location.search);
        return parsed.name;
    }

    static getVersion() {
        const parsed = queryString.parse(window.location.search);
        return parsed.version;
    }


    render() {
        const {supports} = this.props.location
        const supportScopes = supports ? supports : ["host", "kubernetes"];
        const tabPans = [];
        if (supportScopes.indexOf("host") >= 0) {
            tabPans.push(
                <TabPane tab={<span>主机列表</span>} key="host">
                    <Host/>
                </TabPane>
            )
        }
        if (supportScopes.indexOf("kubernetes") >= 0) {
            tabPans.push(
                <TabPane tab={<span>Kubernetes 列表</span>} key="kubernetes">
                    <Kubernetes/>
                </TabPane>
            )
        }
        const toolsName = ChaostoolsDeployed.getName();
        return toolsName ?
            <div>
                <h1>{toolsName}</h1>
                <Tabs defaultActiveKey={supportScopes[0]}>
                    {tabPans}
                </Tabs>
            </div>
            :
            <div>
                选择工具
            </div>
    }
}

const mapStateToProps = state => {
    return {};
}

const mapDispatchToProps = dispatch => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(ChaostoolsDeployed);