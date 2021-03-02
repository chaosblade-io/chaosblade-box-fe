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
import KubernetesExperiment from "./KubernetesExperiment";
import {ExperimentCreatingTabKey} from "../../../constants/ExperimentConstants";

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
        content: <KubernetesExperiment/>,
    },
    {
        title: "page.experiment.creating.application.dimension.name",
        key: "application",
        imgAlt: "application",
        imgSrc: applicationLogo,
        content: <h1>Coming soon...</h1>,
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
        return null;
    }

    componentDidMount() {
        const {getExperimentById} = this.props;
        const id = ExperimentCreating.getExperimentId();
        if (!_.isEmpty(id)) {
            getExperimentById(id);
        }
    }

    onTabChange(key) {
        const {dimension, onDimensionChanged, clearResult} = this.props;
        if (key !== dimension) {
            if (key === ExperimentCreatingTabKey.KUBERNETES) {
                key = ExperimentCreatingTabKey.POD;
            }
            onDimensionChanged({dimension: key});
        }
        clearResult();
    }

    getTabKey() {
        const {dimension, onDimensionChanged} = this.props;
        const id = ExperimentCreating.getExperimentId();
        let activeKey = dimension;
        if (_.isEmpty(id) && _.isEmpty(dimension)) {
            activeKey = ExperimentCreatingTabKey.DEFAULT;
            onDimensionChanged({dimension: activeKey});
        } else if (!_.isEmpty(id) && _.isEmpty(dimension)) {
            activeKey = ''
        } else if (activeKey === ExperimentCreatingTabKey.CONTAINER || activeKey === ExperimentCreatingTabKey.POD ||
            activeKey === ExperimentCreatingTabKey.NODE) {
            activeKey = ExperimentCreatingTabKey.KUBERNETES;
        }
        return activeKey;
    }

    render() {
        const activeKey = this.getTabKey();
        return (
            <div>
                <h1>选择演练维度</h1>
                <div className={styles.experimentHeader}>
                    {activeKey ?
                        <Row>
                            <Tabs defaultActiveKey={activeKey} className={styles.stepTab}
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
                        :
                        <Row/>
                    }
                </div>
            </div>
        );
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
        onDimensionChanged: dimension => dispatch(Actions.onDimensionChanged(dimension)),
        getExperimentById: experimentId => dispatch(Actions.getExperimentById(experimentId)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExperimentCreating);