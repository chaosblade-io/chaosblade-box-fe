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
import {Card, Col, Row, Statistic} from "antd";
import {connect} from "react-redux";

class ExperimentStatistics extends React.Component {

    constructor() {
        super();
    }

    componentDidMount() {
        const {getExperimentStatistics} = this.props;
        getExperimentStatistics();
    }

    render() {
        const {statistics} = this.props;
        const {totals, finished, failure, running, exception} = statistics;
        return (
            <div>
                <Row gutter={[8, 8]}>
                    <Col flex={1}>
                        <Card>
                            <Statistic
                                title="总计"
                                value={totals}
                            />
                        </Card>
                    </Col>
                    <Col flex={1}>
                        <Card>
                            <Statistic
                                title="运行中"
                                value={running}
                            />
                        </Card>
                    </Col>
                    <Col flex={1}>
                        <Card>
                            <Statistic
                                title="已完成"
                                value={finished}
                            />
                        </Card>
                    </Col>
                    <Col flex={1}>
                        <Card>
                            <Statistic
                                title="成功"
                                value={exception}
                            />
                        </Card>
                    </Col>
                    <Col flex={1}>
                        <Card>
                            <Statistic
                                title="失败"
                                value={failure}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const experiment = state.experiment.toJS();
    return {
        statistics: experiment.statistics,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getExperimentStatistics: () => dispatch(Actions.getExperimentStatistics())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExperimentStatistics);