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

import {Card, Col, Divider, Row, Statistic} from 'antd';
import './Application.module.scss'
import {connect} from "react-redux";
import Actions from "../../../actions/Actions";
import {FormattedMessage} from "react-intl";


class ApplicationStatistics extends React.Component {
    constructor() {
        super();
    }

    componentDidMount() {
        const {getApplicationTotalStatistics} = this.props;
        getApplicationTotalStatistics(true);
    }

    render() {
        const {statistics} = this.props;
        const {apps, groups, machines} = statistics
        return (
            <div className="site-statistic-demo-card">
                <div className="total-statistic-card">
                    <Row gutter={[8, 8]}>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title=<FormattedMessage id={"page.machine.app.count"}/>
                                    value={apps}
                                    valueStyle={{color: '#3f8600'}}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title=<FormattedMessage id={"page.machine.app.groupCount"}/>
                                    value={groups}
                                    valueStyle={{color: '#3f8600'}}
                                    // prefix={<ArrowUpOutlined/>}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title=<FormattedMessage id={"page.machine.host.count"}/>
                                    value={machines}
                                    valueStyle={{color: '#3f8600'}}
                                />
                            </Card>
                        </Col>
                    </Row>
                </div>
                <Divider dashed type="vertical"/>
            </div>
        )
    }
}

const mapStateToProps = state => {
    // reducer 中注册的
    const machine = state.machine.toJS();
    return {
        statistics: machine.applicationStatistics
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getApplicationTotalStatistics: (active) => dispatch(Actions.getApplicationTotalStatistics(active)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationStatistics);
