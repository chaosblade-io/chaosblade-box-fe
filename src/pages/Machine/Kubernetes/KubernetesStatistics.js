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

class KubernetesStatistics extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const {getK8sResourceStatistics} = this.props;
        getK8sResourceStatistics();
    }

    render() {
        const {clusterStatistics} = this.props;
        const {nodes, namespaces, pods} = clusterStatistics
        return (
            <div>
                <Row gutter={[8, 8]}>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="节点总数"
                                value={nodes}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="命名空间总数"
                                value={namespaces}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Pods总数"
                                value={pods}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const k8s = state.machine.toJS()
    return {
        clusterStatistics: k8s.clusterStatistics
    }
}

const mapDispatchToProps = dispatch => {
    return {getK8sResourceStatistics: () => dispatch(Actions.getK8sResourceStatistics())}
}

export default connect(mapStateToProps, mapDispatchToProps)(KubernetesStatistics);