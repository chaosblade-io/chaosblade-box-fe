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
import Actions from "../../../actions/Actions";
import {connect} from "react-redux";
import {Card, Col, Row, Statistic} from "antd";

class ScenarioStatistics extends React.Component {

    componentDidMount() {
        const {getScenariosStatistics} = this.props;
        getScenariosStatistics()
    }

    render() {
        const {statistics} = this.props
        const {total, basics, applications, containers} = statistics
        return (
            <div className="total-statistic-card">
                <Row gutter={[8, 8]}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="场景总数"
                                value={total}
                                valueStyle={{color: '#3f8600'}}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="基础资源场景数"
                                value={basics}
                                valueStyle={{color: '#3f8600'}}
                                // prefix={<ArrowUpOutlined/>}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="应用服务资源场景数"
                                value={applications}
                                valueStyle={{color: '#3f8600'}}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="容器服务场景数"
                                value={containers}
                                valueStyle={{color: '#3f8600'}}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const scenario = state.scenario.toJS();
    return {
        statistics: scenario.statistics
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getScenariosStatistics: () => dispatch(Actions.getScenariosStatistics()),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ScenarioStatistics);