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
import {List, Space} from "antd";
import _ from 'lodash';
import * as request from "../../Machine/libs/request";
import {MoreOutlined, ToolOutlined, UnorderedListOutlined} from "@ant-design/icons";


class MarketList extends React.Component {

    constructor(props) {
        super(props);
    }

    fetchPublicChaostoolsList() {
        const {fetchPublicChaostools} = this.props;
        fetchPublicChaostools(
            data => {
                const {publics} = data;
                if (!_.isEmpty(publics)) {
                    publics.map(name => {
                        this.fetchChaostoolsOverview(name);
                    })
                }
            }
        );
    }

    fetchChaostoolsOverview(name) {
        const {fetchChaostoolsOverview} = this.props;
        fetchChaostoolsOverview(name);
    }

    componentDidMount() {
        this.fetchPublicChaostoolsList();
    }

    detail(name, version, anchor) {
        const {history} = this.props;
        let query = {name, version};
        if (!_.isEmpty(anchor)) {
            query = {...query, anchor}
        }
        history.push(`/chaostools/market/detail/?${request.generateUrlSearch({...query})}`);
    }

    deployed(name, version) {
        const {history} = this.props;
        let query = {name, version};
        history.push(`/chaostools/market/deployed/?${request.generateUrlSearch({...query})}`);
    }

    render() {
        const {chaostools, loading} = this.props;
        return (
            <List
                loading={loading}
                style={{marginTop: 16}}
                itemLayout="vertical"
                size="large"
                split
                pagination={{
                    pageSize: 10,
                }}
                dataSource={chaostools ? chaostools : []}
                renderItem={item => (
                    <List.Item
                        key={item.title}
                        actions={[
                            <Space>
                                <UnorderedListOutlined/>
                                <a onClick={this.detail.bind(this, item.name, item.latest, "scenarios")}>
                                    场景管理
                                </a>
                            </Space>,
                            <Space>
                                <ToolOutlined/>
                                <a onClick={this.deployed.bind(this, item.name, item.latest, "deployed")}>
                                    工具管理
                                </a>
                            </Space>,
                            <Space>
                                <MoreOutlined/>
                                <a onClick={this.detail.bind(this, item.name, item.latest, "information")}>查看更多详情</a>
                            </Space>,
                        ]}
                        extra={
                            <img
                                height={150}
                                width={200}
                                alt="logo"
                                src={item.logo}
                            />
                        }
                    >
                        <List.Item.Meta
                            title={<a
                                onClick={this.detail.bind(this, item.name, item.latest, "information")}>{item.title}(v{item.latest})</a>}
                            description={item.description}
                        />
                        {item.readme}
                    </List.Item>
                )}
            />
        );
    }
}

const mapStateToProps = state => {
    const chaostools = state.chaostools.toJS();
    return {
        chaostools: chaostools.chaostools,
        publics: chaostools.publics,
        loading: chaostools.loading,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchPublicChaostools: callback => dispatch(Actions.fetchPublicChaostools(callback)),
        fetchChaostoolsOverview: name => dispatch(Actions.fetchChaostoolsOverview(name)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketList);