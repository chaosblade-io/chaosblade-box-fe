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
import {Card, Col, Row, Statistic} from "antd";
import {connect} from "react-redux";
import Actions from "../../../actions/Actions";

class HostStatistics extends React.Component {

    componentDidMount() {
        const {getHostTotalStatistics} = this.props;
        getHostTotalStatistics();
    }

    render() {
        const {totals, onlines} = this.props;
        return (
            <div>
                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <Card>
                            <Statistic
                                title="机器总数"
                                value={totals}
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card>
                            <Statistic
                                title="在线机器数"
                                value={onlines}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}

const mapStateToProps = state => {
    const machine = state.machine.toJS();
    return {
        totals: machine.hostStatistics.totals,
        onlines: machine.hostStatistics.onlines,
    }
}
const mapDispatchToProps = dispatch => {
    return {
        getHostTotalStatistics: () => dispatch(Actions.getHostTotalStatistics())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HostStatistics);
