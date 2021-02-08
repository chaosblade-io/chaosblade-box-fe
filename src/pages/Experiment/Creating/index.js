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
import {Card, Col, Row, Tabs} from "antd";
import {FormattedMessage} from "react-intl";
import HostExperiment from "./HostExperiment";
import * as request from "../../Machine/libs/request";
import _ from 'lodash'
import {connect} from "react-redux";
import Actions from "../../../actions/Actions";
import queryString from "query-string";
import linuxLogo from '../../../assets/images/experiment/linux.svg'
import kubernetesLogo from '../../../assets/images/experiment/kubernetes.svg'
import applicationLogo from '../../../assets/images/experiment/application.svg'
import styles from './index.module.scss';

const {TabPane} = Tabs

const ExperimentDimensions = [
    {
        title: "page.experiment.creating.host.dimension.name",
        key: "host",
        imgAlt: "host",
        imgSrc: linuxLogo,
        content: <HostExperiment/>,
    },
    {
        title: "page.experiment.creating.kubernetes.dimension.name",
        key: "kubernetes",
        imgAlt: "kubernetes",
        imgSrc: kubernetesLogo,
        // content: <KubernetesExperiment/>,
        content: <h1>敬请期待...</h1>,
    },
    {
        title: "page.experiment.creating.application.dimension.name",
        key: "application",
        imgAlt: "application",
        imgSrc: applicationLogo,
        content: <h1>敬请期待...</h1>,
    },
]


class ExperimentCreating extends React.Component {

    constructor(props) {
        super(props);
    }

    static getExperimentId() {
        const parsed = queryString.parse(window.location.search);
        const {id} = parsed;
        return id;
    }

    static getDerivedStateFromProps(nextProps) {
        const {history, experimentId, clearResult, finished} = nextProps;
        if (finished && !_.isEmpty(experimentId)) {
            clearResult();
            history.push(`/experiment/detail/?${request.generateUrlSearch({id: experimentId})}`);
        }
    }

    onTabChange(key) {
        const {dimension, clearResult, onDimensionChanged} = this.props;
        if (key !== dimension) {
            // clearResult();
            onDimensionChanged(key);
        }
    }

    render() {
        const {dimension} = this.props;
        return (
            <div>
                <h1>选择演练维度</h1>
                <div className={styles.experimentHeader}>
                    <Row>
                        <Tabs defaultActiveKey={dimension} className={styles.stepTab}
                              onChange={this.onTabChange.bind(this)}>
                            {
                                ExperimentDimensions.map(item => (
                                        <TabPane
                                            tab={
                                                <Col span={4}>
                                                    <Card
                                                        style={{width: 300}}
                                                        bordered={true}
                                                        hoverable={true}
                                                        title={
                                                            <>
                                                                <FormattedMessage id={item.title}/>
                                                            </>
                                                        }
                                                        cover={<img alt={item.imgAlt} src={item.imgSrc}
                                                                    style={{
                                                                        width: 296,
                                                                        height: 182
                                                                    }}/>}
                                                    />
                                                </Col>
                                            }
                                            key={item.key}>
                                            {item.content}
                                        </TabPane>
                                    )
                                )
                            }
                        </Tabs>
                    </Row>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    const experiment = state.experimentCreating.toJS();
    return {
        dimension: experiment.dimension,
        experimentId: experiment.experimentId,
        finished: experiment.finished,
    }
}
const mapDispatchToProps = dispatch => {
    return {
        clearResult: () => dispatch(Actions.clearExperimentCreatingResult()),
        onDimensionChanged: dimension => dispatch(Actions.onDimensionChanged()),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExperimentCreating);