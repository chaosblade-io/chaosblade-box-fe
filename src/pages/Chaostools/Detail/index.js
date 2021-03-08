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
import {Divider, PageHeader, Row, Space, Spin, Typography} from "antd";
import {connect} from "react-redux";
import Actions from "../../../actions/Actions";
import queryString from "query-string";
import Scenarios from "./Scenarios";
import Deploy from "./Deploy";
import _ from 'lodash';
import styles from './index.module.scss'
import {GlobalOutlined} from "@ant-design/icons";

const {Paragraph} = Typography;

const Content = ({children, extraContent}) => (
    <Row>
        <div style={{flex: 1}}>{children}</div>
        <div className="image">{extraContent}</div>
    </Row>
);

class ChaostoolsDetail extends React.Component {
    constructor(props) {
        super(props);
    }

    static getToolsName() {
        const parsed = queryString.parse(window.location.search);
        const {name} = parsed;
        return name;
    }

    static getToolsVersion() {
        const parsed = queryString.parse(window.location.search);
        const {version} = parsed;
        return version;
    }

    componentWillMount() {
        const {fetchChaostoolsOverview, fetchChaostoolsVersionInfo} = this.props;
        const name = ChaostoolsDetail.getToolsName();
        const version = ChaostoolsDetail.getToolsVersion();
        fetchChaostoolsOverview(name);
        fetchChaostoolsVersionInfo(name, version);
    }

    render() {
        const {scenarioFiles, loading, title, website, description} = this.props;
        return (
            <div>
                <div id="information" className={styles.pageHeader}>
                    <PageHeader
                        title={<span>{title}</span>}
                        subTitle="选择有很多，将来会更多..."
                        tags={<Space><GlobalOutlined /><a href={website} target={'_blank'}>官网</a></Space>}
                    >
                        <Content>
                            <Paragraph>
                                {description}
                            </Paragraph>
                        </Content>
                    </PageHeader>
                </div>
                <Divider dashed/>
                <Spin spinning={loading}>
                    {
                        _.isEmpty(scenarioFiles) ? <span>暂无</span> : <Scenarios/>
                    }
                </Spin>
                <Divider dashed/>
                <Deploy/>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const detail = state.chaostoolsDetail.toJS();
    const {versionInfo, tools} = detail;
    return {
        loading: versionInfo.loading,
        version: versionInfo.version,
        releaseUrl: versionInfo.releaseUrl,
        downloadUrl: versionInfo.downloadUrl,
        changelog: versionInfo.changelog,
        scenarioFiles: versionInfo.scenarioFiles,
        title: tools.title,
        website: tools.webSite,
        description: tools.description,
    }
}
const mapDispatchToProps = dispatch => {
    return {
        fetchChaostoolsOverview: name => dispatch(Actions.fetchChaostoolsOverview(name)),
        fetchChaostoolsVersionInfo: (name, version) => dispatch(Actions.fetchChaostoolsVersionInfo(name, version)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ChaostoolsDetail);